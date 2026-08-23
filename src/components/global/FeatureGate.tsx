/**
 * SOT UI INTEGRATION: consumes ../../../resources.ts's evaluateFeatureGate
 * on the frontend. See CLAUDE.md 3A -- sidebar/route gating is meant to
 * evaluate through this same helper rather than duplicating gate logic.
 *
 * Ported from react-feature-gate.tsx with two changes for this app:
 * - NativeGuardedButton dropped (no React Native/Expo target here).
 * - DefaultUpgradeModal recolored to this app's real @theme tokens
 *   (src/index.css) instead of the reference file's raw slate/amber
 *   Tailwind palette, matching the surface/backdrop/button conventions
 *   already established in BankModal.tsx/TransferModal.tsx.
 */

import React, { createContext, useContext, ReactNode } from "react";
import {
  evaluateFeatureGate,
  RESOURCES,
  type PlanKey,
  type Role,
  type UsageCache,
  type ResourceKey,
  type Operation,
  type GateResult,
} from "../../../resources";

interface FeatureGateSession {
  plan: PlanKey;
  role: Role;
  consumed: Record<ResourceKey, number>;
  triggerUpgradeFlow: (params: { resource: ResourceKey; message: string }) => void;
}

const FeatureGateContext = createContext<FeatureGateSession | undefined>(undefined);

/**
 * Global context provider for the active org's plan/role/usage cache.
 * Wrap the app root with this once org context has loaded (see App.tsx).
 */
export const FeatureGateProvider = ({
  children,
  plan,
  role,
  consumed,
  onTriggerUpgrade,
}: {
  children: ReactNode;
  plan: PlanKey;
  role: Role;
  consumed: Record<ResourceKey, number>;
  onTriggerUpgrade: (params: { resource: ResourceKey; message: string }) => void;
}) => {
  return (
    <FeatureGateContext.Provider value={{ plan, role, consumed, triggerUpgradeFlow: onTriggerUpgrade }}>
      {children}
    </FeatureGateContext.Provider>
  );
};

/**
 * Granular feature-gate checks for buttons, tab toggles, or inline handlers.
 */
export function useFeatureGate() {
  const context = useContext(FeatureGateContext);
  if (!context) {
    throw new Error("useFeatureGate must be used within a FeatureGateProvider");
  }

  const { plan, role, consumed, triggerUpgradeFlow } = context;
  const usage: UsageCache = { plan, consumed };

  const checkGate = (resource: ResourceKey, operation: Operation): GateResult => {
    return evaluateFeatureGate({ resource, operation, role, usage });
  };

  /**
   * Runs `action` if allowed, otherwise triggers the upgrade flow instead
   * of running it.
   */
  const executeGuardedAction = (resource: ResourceKey, operation: Operation, action: () => void) => {
    const check = checkGate(resource, operation);
    if (check.allowed) {
      action();
    } else {
      triggerUpgradeFlow({
        resource,
        message: check.upgradeMessage || `Upgrade to access ${RESOURCES[resource].name}.`,
      });
    }
  };

  return { checkGate, executeGuardedAction, activePlan: plan, activeRole: role, usage };
}

interface FeatureGateProps {
  resource: ResourceKey;
  operation: Operation;
  /** Slot rendered in place of children when access is denied. */
  fallbackSlot?: ReactNode;
  /** If true, render children but intercept clicks with the upgrade flow instead of hiding them. */
  interceptActionOnly?: boolean;
  children: ReactNode;
}

/**
 * Declarative access guard for wrapping buttons/sections tied to a
 * resources.ts ResourceKey.
 */
export const FeatureGate = ({
  resource,
  operation,
  fallbackSlot,
  interceptActionOnly = false,
  children,
}: FeatureGateProps) => {
  const { checkGate, executeGuardedAction } = useFeatureGate();
  const check = checkGate(resource, operation);

  if (!check.allowed) {
    if (interceptActionOnly) {
      return (
        <div
          onClickCapture={(e) => {
            e.stopPropagation();
            e.preventDefault();
            executeGuardedAction(resource, operation, () => {});
          }}
          className="relative cursor-not-allowed opacity-80 group"
        >
          {children}
          <div className="absolute inset-0 flex items-center justify-center bg-deep-navy/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
            <span className="text-xs bg-deep-navy text-clean-white px-2 py-1 rounded shadow-lg border border-deep-navy">
              🔒 Premium Feature
            </span>
          </div>
        </div>
      );
    }

    return <>{fallbackSlot || null}</>;
  }

  return <>{children}</>;
};

export const DefaultUpgradeModal = ({
  isOpen,
  onClose,
  message,
}: {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-deep-navy/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-md bg-clean-white rounded-modal shadow-2xl p-6">
        <div className="flex items-center space-x-3 text-clarity-purple mb-4">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h3 className="text-lg font-semibold text-deep-navy">Unlock Premium Capability</h3>
        </div>

        <p className="text-sm leading-relaxed text-gray-500 mb-6">{message}</p>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-button border border-mist-purple/20 bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-deep-navy transition-colors"
          >
            Stay on Plan
          </button>
          <button
            onClick={() => {
              // Redirect or load Stripe/Clerk portal
              alert("Navigating to Billing Dashboard...");
            }}
            className="btn-primary flex-1"
          >
            View Upgrades
          </button>
        </div>
      </div>
    </div>
  );
};
