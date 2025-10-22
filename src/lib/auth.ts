// Authentication utility for admin panel
export interface AdminCredentials {
  email: string;
  password: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

// API tabanlı giriş fonksiyonu
export async function validateAdminCredentials(credentials: AdminCredentials): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return { success: true, user: data.user };
    } else {
      return { success: false, error: data.error || 'Giriş başarısız' };
    }
  } catch (error) {
    console.error('Giriş hatası:', error);
    return { success: false, error: 'Bağlantı hatası' };
  }
}

export function setAdminSession(user: AdminUser): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('admin_authenticated', 'true');
    sessionStorage.setItem('admin_user', JSON.stringify(user));
  }
}

export function clearAdminSession(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('admin_authenticated');
    sessionStorage.removeItem('admin_user');
  }
}

export function isAdminAuthenticated(): boolean {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('admin_authenticated') === 'true';
  }
  return false;
}

export function getAdminUser(): AdminUser | null {
  if (typeof window !== 'undefined') {
    const userStr = sessionStorage.getItem('admin_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
  }
  return null;
}