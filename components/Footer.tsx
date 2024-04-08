import React from 'react';
import Image from 'next/image';
import DiscordImg from '../public/discord.png';
import TelegramImg from '../public/telegram.png';
import GitbookImg from '../public/gitbook.png';
import GitHubImg from '../public/github.png';
import TwitterImg from '../public/twitter.png';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <div className="font-lexend bg-dextergreen pb-80 pt-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="text-center text-lg font-semibold leading-8 text-gray-900">
          Follow DeXter Everywhere
        </h2>
        <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-2 sm:gap-x-8 sm:gap-y-4 lg:mx-0 lg:max-w-none lg:grid-cols-5">
          <div className="flex justify-center">
            <Link href="https://t.me/dexter_discussion/" target="_blank">
              <Image
                className="max-h-12 object-contain cursor-pointer"
                src={TelegramImg}
                alt={'Telegram'}
                width={158}
                height={48}
              />
            </Link>
          </div>

          <div className="flex justify-center">
            <Link href="https://twitter.com/DexterOnRadix/" target="_blank">
              <Image
                className="max-h-12 object-contain cursor-pointer"
                src={TwitterImg}
                alt={'Twitter'}
                width={158}
                height={48}
              />
            </Link>
          </div>

          <div className="flex justify-center">
            <Link href="https://discord.com/invite/GX58FUGP/" target="_blank">
              <Image
                className="max-h-12 object-contain cursor-pointer"
                src={DiscordImg}
                alt={'Discord'}
                width={158}
                height={48}
              />
            </Link>
          </div>

          <div className="flex justify-center">
            <Link href="https://github.com/DeXter-on-Radix" target="_blank">
              <Image
                className="max-h-12 object-contain cursor-pointer"
                src={GitHubImg}
                alt={'GitHub'}
                width={158}
                height={48}
              />
            </Link>
          </div>

          <div className="flex justify-center">
            <Link
              href="https://dexter-on-radix.gitbook.io/dexter/"
              target="_blank"
            >
              <Image
                className="max-h-12 object-contain cursor-pointer"
                src={GitbookImg}
                alt={'Gitbook'}
                width={158}
                height={48}
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
