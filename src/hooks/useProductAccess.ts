import { useState, useEffect } from 'react';
import { useProductAssignments } from '@/hooks/useProductAssignments';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export interface ProductAccess {
  canView: boolean;
  canEdit: boolean;
  canViewPricing: boolean;
  accessReason: 'admin' | 'manager' | 'assignment' | 'none';
  assignment?: any;
}

export function useProductAccess(productId: string, productType: string) {
  const { assignments } = useProductAssignments();
  const { profile } = useCurrentUser();
  const [access, setAccess] = useState<ProductAccess>({
    canView: false,
    canEdit: false,
    canViewPricing: false,
    accessReason: 'none'
  });

  useEffect(() => {
    if (!profile) {
      setAccess({
        canView: false,
        canEdit: false,
        canViewPricing: false,
        accessReason: 'none'
      });
      return;
    }

    // Vérifier les rôles admin/manager
    const isAdmin = profile.role === 'admin';
    const isManager = profile.role === 'manager';
    
    if (isAdmin) {
      setAccess({
        canView: true,
        canEdit: true,
        canViewPricing: true,
        accessReason: 'admin'
      });
      return;
    }

    if (isManager) {
      setAccess({
        canView: true,
        canEdit: true,
        canViewPricing: true,
        accessReason: 'manager'
      });
      return;
    }

    // Vérifier les assignations pour les autres rôles
    const userAssignment = assignments.find(a => 
      a.product_id === productId && 
      a.product_type === productType && 
      a.assigned_to_id === profile.id
    );

    if (userAssignment) {
      setAccess({
        canView: true,
        canEdit: false,
        canViewPricing: false,
        accessReason: 'assignment',
        assignment: userAssignment
      });
      return;
    }

    // Aucun accès
    setAccess({
      canView: false,
      canEdit: false,
      canViewPricing: false,
      accessReason: 'none'
    });

  }, [profile, assignments, productId, productType]);

  return access;
}

export function useCanAccessProduct(productId: string, productType: string): boolean {
  const access = useProductAccess(productId, productType);
  return access.canView;
}

export function useCanEditProduct(productId: string, productType: string): boolean {
  const access = useProductAccess(productId, productType);
  return access.canEdit;
}

export function useCanViewProductPricing(productId: string, productType: string): boolean {
  const access = useProductAccess(productId, productType);
  return access.canViewPricing;
} 