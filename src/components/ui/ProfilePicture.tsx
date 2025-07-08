import React from 'react';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfilePictureProps {
  user?: {
    name?: string;
    image?: string;
    profilePicture?: string;
    avatar?: string;
    role?: string;
  };
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showOnlineStatus?: boolean;
  isOnline?: boolean;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  user,
  size = 'md',
  className,
  showOnlineStatus = false,
  isOnline = false
}) => {
  // Get profile picture URL (priority: profilePicture > image > avatar)
  const profileImageUrl = user?.profilePicture || user?.image || user?.avatar;
  
  // Get user initials for fallback
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Size classes
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  };

  // Role-based background colors
  const getRoleColor = (role?: string) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return 'bg-red-500';
      case 'DOCTOR':
      case 'PROVIDER':
        return 'bg-green-500';
      case 'PATIENT':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const initials = getInitials(user?.name);
  const roleColor = getRoleColor(user?.role);

  return (
    <div className={cn('relative inline-block', className)}>
      <div
        className={cn(
          'rounded-full flex items-center justify-center overflow-hidden border-2 border-white dark:border-gray-800 shadow-sm',
          sizeClasses[size]
        )}
      >
        {profileImageUrl ? (
          <img
            src={profileImageUrl}
            alt={user?.name || 'Profile'}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to initials if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `
                  <div class="w-full h-full ${roleColor} flex items-center justify-center text-white font-medium">
                    ${initials}
                  </div>
                `;
              }
            }}
          />
        ) : (
          <div className={cn(
            'w-full h-full flex items-center justify-center text-white font-medium',
            roleColor
          )}>
            {initials}
          </div>
        )}
      </div>
      
      {/* Online status indicator */}
      {showOnlineStatus && (
        <div
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-white dark:border-gray-800',
            size === 'xs' ? 'w-2 h-2' : 
            size === 'sm' ? 'w-2.5 h-2.5' :
            size === 'md' ? 'w-3 h-3' :
            size === 'lg' ? 'w-3.5 h-3.5' : 'w-4 h-4',
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          )}
        />
      )}
    </div>
  );
};

export default ProfilePicture;
