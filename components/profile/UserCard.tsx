import React from 'react';
import Image from 'next/image';

<Image src={user.avatar_url || '/images/default-avatar.png'} alt={user.name} width={48} height={48} className="w-12 h-12 rounded-full object-cover" /> 