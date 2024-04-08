import {
  CloudArrowUpIcon,
  LockClosedIcon,
  ServerIcon,
} from '@heroicons/react/20/solid';
import Header from '../../components/Header';
import Image from 'next/image';
import Example from '../../public/example.png';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { GetServerSideProps } from 'next';
import React, { useState, useEffect } from 'react';
import { wsPort, webPort, siteDomain } from '../../config';
import Avatar from '../../components/Avatar';

type Contributor = {
  id: number;
  name: string;
  skills: string;
  role: string;
};

type DashboardProps = {
  contributors: Contributor[];
  isAuthenticated: boolean; // add this line
};

const features = [
  {
    name: 'Contributors',
    description:
      'Prior to the start of voting, contributors are invited to share their contributions in the Dexter Telegram discussion group, using the hashtag #nomination1, #nomination 2 etc.. depending on the current cycle.',
  },
  {
    name: 'Nominators',
    description:
      '100 points can be allocated, with a maximum of 40 points to each individual contributor. It is not possible to vote for oneself and nominators are encouraged to consider all contributions.',
  },
  {
    name: 'Process',
    description:
      'Currently the voting window remaning open until the following Monday. This allows the entirety of the weekend for the community to consider how best to vote. Contributors should be identified by their Telegram username',
  },
];

export const getServerSideProps: GetServerSideProps<DashboardProps> = async (
  context,
) => {
  const { req } = context;
  const { cookies } = req;

  // Check if the user is authenticated
  const isAuthenticated = !!cookies.userToken; // The user is authenticated if the userToken cookie is set

  let contributors = []; // Initialize the contributors list

  try {
    const res = await fetch(`${siteDomain}${webPort}/api/conlist`);

    if (!res.ok) {
      console.error(
        `Failed to fetch from API: ${res.status} ${res.statusText}`,
      );
      throw new Error('Network response was not ok');
    }

    const data = await res.json();

    contributors = data.conlist
      .filter((row: any) => row.name !== 'TREASURY')
      .map((row: any) => ({
        id: row.id,
        name: row.name,
        role: row.skills,
      }));
  } catch (err) {
    if (err instanceof Error) {
      console.error(`Failed to get contributors: ${err.message}`);
    } else {
      console.error(`Failed to get contributors: ${err}`);
    }
    // Here you could decide how to handle the error.
    // For example, you could return an empty list of contributors and isAuthenticated as false.
  }

  // If the fetch is successful, return the contributors and isAuthenticated
  return { props: { contributors, isAuthenticated } };
};

const InfoPage: React.FC<DashboardProps> = ({
  contributors,
  isAuthenticated,
}) => {
  // Use the contributors prop directly instead of fetching it in the component
  const [people, setPeople] = useState(contributors);

  return (
    <>
      <Header isLogged={isAuthenticated} />

      <div className="bg-gradient-to-br from-dexterblue via-dextergreen to-dextermegagreen block justify-center items-center min-h-screen py-24 sm:py-32">
        <div className="mt-20 relative isolate flex items-center gap-x-6 overflow-hidden bg-gray-50 px-6 py-2.5 sm:px-3.5 sm:before:flex-1">
          <div
            className="absolute left-[max(-7rem,calc(50%-52rem))] top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-2xl"
            aria-hidden="true"
          >
            <div
              className="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-[#ff80b5] to-[#9089fc] opacity-30"
              style={{
                clipPath:
                  'polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)',
              }}
            />
          </div>
          <div
            className="absolute left-[max(45rem,calc(50%+8rem))] top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-2xl"
            aria-hidden="true"
          >
            <div
              className="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-[#ff80b5] to-[#9089fc] opacity-30"
              style={{
                clipPath:
                  'polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)',
              }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="font-lexend font-normal text-sm leading-6 text-gray-900">
              <strong className="font-lexend font-semibold">
                Want to know more?
              </strong>
              <svg
                viewBox="0 0 2 2"
                className="mx-2 inline h-0.5 w-0.5 fill-current"
                aria-hidden="true"
              >
                <circle cx={1} cy={1} r={1} />
              </svg>
              deXter has a neat Gitbook where you can learn more
            </p>
            <a
              href="https://dexter-on-radix.gitbook.io/dexter/"
              target="_blank"
              className="flex-none rounded-full bg-gray-900 px-3.5 py-1 text-sm font-lexend font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
            >
              Read Gitbook <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
          <div className="flex flex-1 justify-end">
            <button
              type="button"
              className="invisible -m-3 p-3 focus-visible:outline-offset-[-4px]"
            >
              <span className="sr-only">Dismiss</span>
              <XMarkIcon className="h-5 w-5 text-gray-900" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="bg-transperant mt-20 px-4">
          <div className="mx-auto grid max-w-2xl grid-cols-1 items-center gap-x-8 gap-y-16 px-4 py-24 sm:px-6 sm:py-32 lg:max-w-7xl lg:grid-cols-2 lg:px-8">
            <div>
              <h2 className="font-lexend font-semibold text-3xl tracking-tight text-black sm:text-4xl">
                Nomination Process
              </h2>
              <p className="mt-4 font-lexend font-normal text-black">
                Every 2 weeks, to coincide with the token minting schedule, a
                nomination and voting process is undertaken to determine how
                newly minted tokens should be distributed to contributors.{' '}
              </p>

              <dl className="mt-16 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 sm:gap-y-16 lg:gap-x-8">
                {features.map((feature) => (
                  <div
                    key={feature.name}
                    className="border-t border-black pt-4"
                  >
                    <dt className="font-lexend font-normal text-black">
                      {feature.name}
                    </dt>
                    <dd className="mt-2 font-lexend font-normal text-sm text-black">
                      {feature.description}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="flex flex-col items-center">
              <Image src={Example} alt={'Example'} width={1300} />

              <p className="mt-2 font-lexend font-normal text-xs text-black">
                Example contributor summary for nomination cycle 2
              </p>
            </div>
          </div>
        </div>

        <div className="block justify-center items-center min-h-screen py-24 sm:py-32">
          <div className="mt-20 mx-auto grid max-w-7xl gap-x-8 gap-y-20 px-6 lg:px-8 xl:grid-cols-3">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-lexend font-semibold tracking-tight text-black sm:text-4xl">
                Meet our contributors
              </h2>
              <p className="mt-6 text-lg leading-8 text-black font-lexend font-normal ">
                DeXter has already attracted a handful of talented contributors,
                both in development and non-development capacities.
              </p>

              <div className="mt-4">
                <a
                  href="https://dexter-on-radix.gitbook.io/"
                  target="_blank"
                  className="flex-none bg-transperant py-1 text-sm font-lexend font-semibold text-black"
                >
                  {' '}
                  Want to contribute? <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </div>
            <ul
              role="list"
              className="grid gap-x-8 gap-y-12 sm:grid-cols-2 sm:gap-y-16 xl:col-span-2"
            >
              {people.map((person) => (
                <li key={person.name}>
                  <div className="flex items-center gap-x-6">
                    <Avatar
                      name={person.id.toString()}
                      width={80}
                      height={80}
                    />
                    <div>
                      <h3 className="text-base font-lexend font-semibold leading-7 tracking-tight text-black">
                        {person.name}
                      </h3>
                      <p className="text-sm font-lexend font-normal leading-6 text-bgdark">
                        {person.role}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};
export default InfoPage;
