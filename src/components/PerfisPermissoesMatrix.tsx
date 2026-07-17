import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PERMISSION_MODULES, countModulePermissionOptions, isNestedPermissionSubItem, isPermissionSectionHeader } from '../constants/permissionCatalog';
import type { Profile } from '../types/perfisPermissoes.types';
import { isProfileEditable } from '../utils/profileUtils';
import { getModuleSummaryText, getSubItemPermissionDisplayText } from '../utils/permissionDisplay';
import { getModuleIcon, IconChevronDown, IconChevronLeft, IconChevronRight, IconEdit } from './ModuleIcons';
import {
  PermissionReadonlyText,
} from './shared/PermissionReadonlyPills';
import { TruncatedTextTooltip } from './shared/TruncatedTextTooltip';

const VISIBLE_PROFILE_COUNT = 3;
const PROFILE_SCROLL_ANIMATION_MS = 320;

const easeOutCubic = (progress: number) => 1 - (1 - progress) ** 3;

interface PerfisPermissoesMatrixProps {
  profiles: Profile[];
  permissions: Record<string, Record<string, Record<string, string>>>;
  onEditProfile: (profileId: string) => void;
}

export const PerfisPermissoesMatrix: React.FC<PerfisPermissoesMatrixProps> = ({
  profiles,
  permissions,
  onEditProfile,
}) => {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [canScrollProfilesLeft, setCanScrollProfilesLeft] = useState(false);
  const [canScrollProfilesRight, setCanScrollProfilesRight] = useState(false);
  const matrixRef = useRef<HTMLDivElement>(null);
  const bottomScrollRef = useRef<HTMLDivElement>(null);
  const scrollAnimationRef = useRef<number | null>(null);
  const isInternalScrollRef = useRef(false);

  const profileCount = profiles.length;
  const isProfilesScrollable = profileCount > VISIBLE_PROFILE_COUNT;

  const syncProfileScroll = useCallback((scrollLeft: number) => {
    matrixRef.current
      ?.querySelectorAll<HTMLDivElement>('.permissoes-editor__matrix-profiles-track')
      .forEach((track) => {
        track.style.transform = scrollLeft > 0 ? `translateX(-${scrollLeft}px)` : '';
      });
  }, []);

  const setBottomScrollLeft = useCallback((scrollLeft: number) => {
    const scrollElement = bottomScrollRef.current;
    if (!scrollElement) {
      return;
    }

    isInternalScrollRef.current = true;
    scrollElement.scrollLeft = scrollLeft;
  }, []);

  const cancelProfileScrollAnimation = useCallback(() => {
    if (scrollAnimationRef.current !== null) {
      cancelAnimationFrame(scrollAnimationRef.current);
      scrollAnimationRef.current = null;
    }
  }, []);

  const getProfileScrollStep = useCallback(() => {
    const profileHeaders = matrixRef.current?.querySelectorAll<HTMLElement>(
      '.permissoes-editor__matrix-profiles-pane--header .permissoes-editor__header-profile',
    );

    if (profileHeaders && profileHeaders.length >= 2) {
      return profileHeaders[1].offsetLeft - profileHeaders[0].offsetLeft;
    }

    const scrollElement = bottomScrollRef.current;
    if (scrollElement && profileCount > VISIBLE_PROFILE_COUNT) {
      return scrollElement.scrollWidth / profileCount;
    }

    return 0;
  }, [profileCount]);

  const applyProfileScroll = useCallback(
    (scrollLeft: number) => {
      const scrollElement = bottomScrollRef.current;
      if (!scrollElement) {
        return;
      }

      const maxScrollLeft = Math.max(0, scrollElement.scrollWidth - scrollElement.clientWidth);
      const nextScrollLeft = Math.max(0, Math.min(scrollLeft, maxScrollLeft));

      setBottomScrollLeft(nextScrollLeft);
      syncProfileScroll(nextScrollLeft);
      setCanScrollProfilesLeft(nextScrollLeft > 1);
      setCanScrollProfilesRight(nextScrollLeft < maxScrollLeft - 1);
    },
    [setBottomScrollLeft, syncProfileScroll],
  );

  const smoothScrollProfilesTo = useCallback(
    (targetScrollLeft: number) => {
      const scrollElement = bottomScrollRef.current;
      if (!scrollElement) {
        return;
      }

      cancelProfileScrollAnimation();

      const maxScrollLeft = Math.max(0, scrollElement.scrollWidth - scrollElement.clientWidth);
      const target = Math.max(0, Math.min(targetScrollLeft, maxScrollLeft));
      const start = scrollElement.scrollLeft;
      const distance = target - start;

      if (Math.abs(distance) < 1) {
        applyProfileScroll(target);
        return;
      }

      const startTime = performance.now();

      const animate = (now: number) => {
        const progress = Math.min((now - startTime) / PROFILE_SCROLL_ANIMATION_MS, 1);
        const current = start + distance * easeOutCubic(progress);

        setBottomScrollLeft(current);
        syncProfileScroll(current);
        setCanScrollProfilesLeft(current > 1);
        setCanScrollProfilesRight(current < maxScrollLeft - 1);

        if (progress < 1) {
          scrollAnimationRef.current = requestAnimationFrame(animate);
          return;
        }

        scrollAnimationRef.current = null;
        setBottomScrollLeft(target);
        syncProfileScroll(target);
        setCanScrollProfilesLeft(target > 1);
        setCanScrollProfilesRight(target < maxScrollLeft - 1);
      };

      scrollAnimationRef.current = requestAnimationFrame(animate);
    },
    [applyProfileScroll, cancelProfileScrollAnimation, setBottomScrollLeft, syncProfileScroll],
  );

  const updateProfileScrollHints = useCallback(() => {
    const scrollElement = bottomScrollRef.current;

    if (!scrollElement || !isProfilesScrollable) {
      setCanScrollProfilesLeft(false);
      setCanScrollProfilesRight(false);
      return;
    }

    const maxScrollLeft = scrollElement.scrollWidth - scrollElement.clientWidth;

    if (maxScrollLeft <= 1) {
      setCanScrollProfilesLeft(false);
      setCanScrollProfilesRight(false);
      return;
    }

    setCanScrollProfilesLeft(scrollElement.scrollLeft > 1);
    setCanScrollProfilesRight(scrollElement.scrollLeft < maxScrollLeft - 1);
  }, [isProfilesScrollable]);

  const scrollProfiles = useCallback(
    (direction: 'left' | 'right') => {
      const scrollElement = bottomScrollRef.current;
      if (!scrollElement) {
        return;
      }

      const step = getProfileScrollStep();
      if (step <= 0) {
        return;
      }

      const delta = direction === 'left' ? -step : step;
      smoothScrollProfilesTo(scrollElement.scrollLeft + delta);
    },
    [getProfileScrollStep, smoothScrollProfilesTo],
  );

  const handleBottomScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      if (isInternalScrollRef.current) {
        isInternalScrollRef.current = false;
        return;
      }

      if (scrollAnimationRef.current !== null) {
        cancelProfileScrollAnimation();
      }

      syncProfileScroll(event.currentTarget.scrollLeft);
      updateProfileScrollHints();
    },
    [cancelProfileScrollAnimation, syncProfileScroll, updateProfileScrollHints],
  );

  useEffect(() => {
    cancelProfileScrollAnimation();

    setBottomScrollLeft(0);
    syncProfileScroll(0);
    updateProfileScrollHints();
  }, [profileCount, expandedModules, syncProfileScroll, updateProfileScrollHints, cancelProfileScrollAnimation, setBottomScrollLeft]);

  useEffect(() => () => {
    cancelProfileScrollAnimation();
  }, [cancelProfileScrollAnimation]);

  useEffect(() => {
    const scrollElement = bottomScrollRef.current;
    if (!scrollElement || !isProfilesScrollable) {
      return undefined;
    }

    const resizeObserver = new ResizeObserver(() => {
      updateProfileScrollHints();
    });

    resizeObserver.observe(scrollElement);
    updateProfileScrollHints();

    return () => {
      resizeObserver.disconnect();
    };
  }, [isProfilesScrollable, profileCount, updateProfileScrollHints]);

  useEffect(() => {
    if (!isProfilesScrollable || !matrixRef.current) {
      return undefined;
    }

    const matrix = matrixRef.current;

    const blockHorizontalWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) {
        return;
      }

      if ((event.target as Element | null)?.closest('.permissoes-editor__matrix-hscroll')) {
        return;
      }

      event.preventDefault();
    };

    matrix.addEventListener('wheel', blockHorizontalWheel, { passive: false });

    return () => {
      matrix.removeEventListener('wheel', blockHorizontalWheel);
    };
  }, [isProfilesScrollable]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((current) => {
      const next = new Set(current);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const renderProfilesPane = (content: React.ReactNode) => (
    <div className="permissoes-editor__matrix-profiles-pane">
      <div className="permissoes-editor__matrix-profiles-track">{content}</div>
    </div>
  );

  const renderProfilesSection = (content: React.ReactNode) => (
    <>
      <div className="permissoes-editor__matrix-divider" aria-hidden />
      {renderProfilesPane(content)}
    </>
  );

  const renderHeaderProfilesSection = () => (
    <>
      <div className="permissoes-editor__matrix-divider" aria-hidden />
      <div className="permissoes-editor__matrix-profiles-pane permissoes-editor__matrix-profiles-pane--header">
        {canScrollProfilesLeft && (
          <button
            type="button"
            className="permissoes-editor__matrix-scroll-hint permissoes-editor__matrix-scroll-hint--left"
            aria-label="Rolar perfis para a esquerda"
            onClick={() => scrollProfiles('left')}
          >
            <IconChevronLeft />
          </button>
        )}
        {canScrollProfilesRight && (
          <button
            type="button"
            className="permissoes-editor__matrix-scroll-hint permissoes-editor__matrix-scroll-hint--right"
            aria-label="Rolar perfis para a direita"
            onClick={() => scrollProfiles('right')}
          >
            <IconChevronRight />
          </button>
        )}
        <div className="permissoes-editor__matrix-profiles-track">
          {profiles.map((profile) => renderProfileHeader(profile))}
        </div>
      </div>
    </>
  );

  const renderProfileHeader = (profile: Profile) => (
    <div
      key={profile.id}
      className={`permissoes-editor__header-profile${isProfileEditable(profile) ? '' : ' permissoes-editor__header-profile--locked'}`}
    >
      <TruncatedTextTooltip text={profile.name} className="permissoes-editor__profile-name" />
      {isProfileEditable(profile) && (
        <button
          type="button"
          className="permissoes-editor__profile-edit-btn"
          aria-label={`Editar ${profile.name}`}
          onClick={() => onEditProfile(profile.id)}
        >
          <IconEdit />
        </button>
      )}
    </div>
  );

  return (
    <div
      ref={matrixRef}
      className={`permissoes-editor permissoes-editor--matrix${isProfilesScrollable ? ' permissoes-editor--matrix--profiles-scroll' : ''}`}
      style={{ ['--profile-count' as string]: String(profileCount) }}
    >
      <div className="permissoes-editor__scroll">
        <div className="permissoes-editor__header permissoes-editor__header--matrix permissoes-editor__matrix-row">
          <div className="permissoes-editor__header-col permissoes-editor__header-col--modules">
            Módulos
          </div>
          {renderHeaderProfilesSection()}
        </div>

        <div className="permissoes-editor__modules">
          {PERMISSION_MODULES.map((module) => {
            const ModuleIcon = getModuleIcon(module.id);
            const isExpanded = expandedModules.has(module.id);
            const optionCount = countModulePermissionOptions(module);

            return (
              <div
                key={module.id}
                className={`permissoes-editor__module${isExpanded ? ' permissoes-editor__module--expanded' : ''}`}
              >
                <div className="permissoes-editor__module-header permissoes-editor__module-header--matrix permissoes-editor__matrix-row">
                  <div className="permissoes-editor__module-header-left">
                    <button
                      type="button"
                      className={`permissoes-editor__expand-btn${isExpanded ? ' permissoes-editor__expand-btn--open' : ''}`}
                      aria-label={isExpanded ? `Recolher ${module.label}` : `Expandir ${module.label}`}
                      aria-expanded={isExpanded}
                      onClick={() => toggleModule(module.id)}
                    >
                      <IconChevronDown />
                    </button>
                    <span className="permissoes-editor__module-icon" aria-hidden>
                      <ModuleIcon />
                    </span>
                    <div className="permissoes-editor__module-title-wrap">
                      <span className="permissoes-editor__module-title">{module.label}</span>
                      <span className="permissoes-editor__module-count">
                        {optionCount} {optionCount === 1 ? 'opção' : 'opções'}
                      </span>
                    </div>
                  </div>

                  {!isExpanded &&
                    renderProfilesSection(
                      profiles.map((profile) => (
                        <div
                          key={`${module.id}-${profile.id}-summary`}
                          className="permissoes-editor__screen-pills-col"
                        >
                          <PermissionReadonlyText
                            text={getModuleSummaryText(
                              module,
                              permissions[profile.id]?.[module.id],
                            )}
                          />
                        </div>
                      )),
                    )}

                  {isExpanded &&
                    renderProfilesSection(
                      profiles.map((profile) => (
                        <div
                          key={`${module.id}-${profile.id}-header-spacer`}
                          className="permissoes-editor__screen-pills-col permissoes-editor__screen-pills-col--spacer"
                          aria-hidden
                        />
                      )),
                    )}
                </div>

                {isExpanded && (
                  <div className="permissoes-editor__screens">
                    {module.subItems.map((subItem) => {
                      if (isPermissionSectionHeader(subItem)) {
                        return (
                          <div
                            key={subItem.id}
                            className="permissoes-editor__screen-row permissoes-editor__screen-row--section permissoes-editor__screen-row--matrix permissoes-editor__matrix-row"
                          >
                            <div className="permissoes-editor__screen-label-col">
                              <span className="permissoes-editor__screen-section-label">{subItem.label}</span>
                            </div>
                            {renderProfilesSection(
                              profiles.map((profile) => (
                                <div
                                  key={`${module.id}-${subItem.id}-${profile.id}`}
                                  className="permissoes-editor__screen-pills-col permissoes-editor__screen-pills-col--section"
                                  aria-hidden
                                />
                              )),
                            )}
                          </div>
                        );
                      }

                      return (
                      <div
                        key={subItem.id}
                        className={`permissoes-editor__screen-row permissoes-editor__screen-row--matrix permissoes-editor__matrix-row${isNestedPermissionSubItem(module, subItem) ? ' permissoes-editor__screen-row--nested' : ''}`}
                      >
                        <div className="permissoes-editor__screen-label-col">
                          <span className="permissoes-editor__screen-label">{subItem.label}</span>
                          {subItem.description && (
                            <span className="permissoes-editor__screen-description">{subItem.description}</span>
                          )}
                        </div>
                        {renderProfilesSection(
                          profiles.map((profile) => (
                            <div
                              key={`${module.id}-${subItem.id}-${profile.id}`}
                              className="permissoes-editor__screen-pills-col"
                            >
                              <PermissionReadonlyText
                                text={getSubItemPermissionDisplayText(
                                  subItem,
                                  permissions[profile.id]?.[module.id]?.[subItem.id] ?? '',
                                )}
                              />
                            </div>
                          )),
                        )}
                      </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {isProfilesScrollable && (
          <div className="permissoes-editor__matrix-hscroll-row permissoes-editor__matrix-row">
            <div className="permissoes-editor__matrix-hscroll-spacer" aria-hidden />
            <div className="permissoes-editor__matrix-divider" aria-hidden />
            <div
              ref={bottomScrollRef}
              className="permissoes-editor__matrix-hscroll"
              onScroll={handleBottomScroll}
              aria-label="Rolar perfis horizontalmente"
            >
              <div className="permissoes-editor__matrix-hscroll-inner" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
