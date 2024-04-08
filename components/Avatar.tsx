import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface AvatarProps {
  name: string;
  width: number;
  height: number;
  marginRight?: number;
  marginLeft?: number; // Added paddingLeft here
}

const defaultImageUrl = '/contimg/default.jpg';

const Avatar: React.FC<AvatarProps> = ({
  name,
  width,
  height,
  marginRight = 0,
  marginLeft = 0, // Set a default value
}) => {
  const [imageUrl, setImageUrl] = useState(
    name ? `/contimg/${name}.jpg` : defaultImageUrl,
  );

  useEffect(() => {
    const fetchId = async () => {
      if (isNaN(Number(name))) {
        try {
          const response = await fetch(`/api/fromname?name=${name}`);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          const id = data.ID;
          // console.log('GETTING THE ID');
          // console.log(id);
          setImageUrl(`/contimg/${id}.jpg`);
        } catch (error) {
          // console.error(error);
        }
      }
    };

    fetchId();
  }, [name]);

  const handleImageError = () => {
    setImageUrl(defaultImageUrl);
  };

  return (
    <div
      style={{ width, height, marginRight, marginLeft }} // Apply marginLeft here
      className="relative rounded-full flex-shrink-0"
    >
      <Image
        className="rounded-full"
        src={imageUrl}
        width={width}
        height={height}
        alt=""
        // layout="fill"
        // objectFit="cover"
        onError={handleImageError}
      />
    </div>
  );
};

export default Avatar;
