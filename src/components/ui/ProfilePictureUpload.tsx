import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { profileApi } from '@/api/profile';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ProfilePicture from './ProfilePicture';
import { cn } from '@/lib/utils';

interface ProfilePictureUploadProps {
  user?: {
    name?: string;
    image?: string;
    profilePicture?: string;
    avatar?: string;
    role?: string;
  };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onUploadSuccess?: (imageUrl: string) => void;
  showUploadButton?: boolean;
  showDeleteButton?: boolean;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  user,
  size = 'lg',
  className,
  onUploadSuccess,
  showUploadButton = true,
  showDeleteButton = true
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: (file: File) => profileApi.uploadProfilePicture(file),
    onSuccess: (response) => {
      if (response.success && response.data) {
        toast({
          title: "Success!",
          description: "Profile picture updated successfully",
        });
        
        // Update the auth user cache
        queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
        
        // Call success callback
        onUploadSuccess?.(response.data.profilePictureUrl);
        
        // Clear preview
        setPreviewUrl(null);
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : "Failed to upload profile picture";
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsUploading(false);
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => profileApi.deleteProfilePicture(),
    onSuccess: (response) => {
      if (response.success) {
        toast({
          title: "Success!",
          description: "Profile picture removed successfully",
        });
        
        // Update the auth user cache
        queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
      } else {
        throw new Error(response.error || 'Delete failed');
      }
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : "Failed to remove profile picture";
      toast({
        title: "Delete Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setIsUploading(true);
    uploadMutation.mutate(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteClick = () => {
    if (window.confirm('Are you sure you want to remove your profile picture?')) {
      deleteMutation.mutate();
    }
  };

  const currentImageUrl = previewUrl || user?.profilePicture || user?.image || user?.avatar;
  const hasProfilePicture = !!(user?.profilePicture || user?.image || user?.avatar);

  return (
    <div className={cn('relative inline-block', className)}>
      {/* Profile Picture Display */}
      <div className="relative">
        <ProfilePicture 
          user={previewUrl ? { ...user, profilePicture: previewUrl } : user}
          size={size}
          className={cn(
            'transition-all duration-200',
            isUploading && 'opacity-50'
          )}
        />
        
        {/* Loading overlay */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        )}

        {/* Upload button overlay */}
        {showUploadButton && (
          <button
            onClick={handleUploadClick}
            disabled={isUploading}
            className={cn(
              'absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-50 rounded-full transition-all duration-200 group',
              size === 'sm' ? 'text-xs' : 
              size === 'md' ? 'text-sm' : 
              size === 'lg' ? 'text-base' : 'text-lg'
            )}
          >
            <Camera className={cn(
              'text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200',
              size === 'sm' ? 'h-3 w-3' :
              size === 'md' ? 'h-4 w-4' :
              size === 'lg' ? 'h-5 w-5' : 'h-6 w-6'
            )} />
          </button>
        )}
      </div>

      {/* Action buttons */}
      {(showUploadButton || showDeleteButton) && (
        <div className="flex gap-2 mt-3 justify-center">
          {showUploadButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleUploadClick}
              disabled={isUploading}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {currentImageUrl ? 'Change' : 'Upload'}
            </Button>
          )}
          
          {showDeleteButton && hasProfilePicture && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteClick}
              disabled={deleteMutation.isPending}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default ProfilePictureUpload;
