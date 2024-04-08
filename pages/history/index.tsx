import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Header from '../../components/Header';
import TopBanner from '../../components/TopBanner';
import Link from 'next/link';
import { wsPort, webPort, siteDomain } from '../../config';
import Avatar from '../../components/Avatar';

type Contributor = {
  contributor_name: string;
  points_sum: number;
  tokensAllocated: number;
  phase_id: number;
};

type HistoryProps = {
  contributors: Contributor[];
  phaseId: number | null; // Allow phaseId to be null
  isAuthenticated: boolean; // add this line
};

export const getServerSideProps: GetServerSideProps<HistoryProps> = async (
  context,
) => {
  const { req, query } = context;
  const { cookies } = req;

  // Modify this line to match the authentication check in the dashboard page
  const isAuthenticated = !!cookies.userToken;

  const phaseId = parseInt(query.phaseId as string, 10) || null; // Parse phaseId from query string, fallback to null if not provided
  // Fetch data for the selected phaseId
  const res = await fetch(
    `${siteDomain}${webPort}/api/contributors-history?phaseId=${phaseId}`,
  );
  const data = await res.json();
  const contributors = data.contributors || [];

  return { props: { contributors, phaseId, isAuthenticated } };
};

const History: React.FC<HistoryProps> = ({
  contributors,
  phaseId,
  isAuthenticated,
}) => {
  const [selectedPhaseId, setSelectedPhaseId] = useState(phaseId || null);
  const [uniqueVoters, setUniqueVoters] = useState<string[]>([]); // Add state for unique voters

  useEffect(() => {
    const fetchSmallestPhaseId = async () => {
      try {
        const res = await fetch(`${siteDomain}${webPort}/api/smallest-phase`);
        const data = await res.json();
        setSelectedPhaseId(data.smallestPhaseId || 1); // set to 1 if smallestPhaseId is null
      } catch (error) {
        console.error(error);
        setSelectedPhaseId(1);
      }
    };

    if (!phaseId) {
      fetchSmallestPhaseId();
    }
  }, [phaseId]);

  const [cntbtrs, setContributors] = useState<Contributor[]>([]);
  const [phaseIds, setPhaseIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(
        `${siteDomain}${webPort}/api/contributors-history?phaseId=${selectedPhaseId}`,
      );
      const data = await res.json();

      const cntbtrs = data.contributors || [];

      setContributors(cntbtrs);
    };

    fetchData();
  }, [selectedPhaseId]);

  // Fetch phase IDs
  useEffect(() => {
    const fetchPhaseIds = async () => {
      const res = await fetch(`${siteDomain}${webPort}/api/all-phases`);
      const data = await res.json();
      setPhaseIds(data.phaseIds);
    };
    fetchPhaseIds();
  }, []);

  useEffect(() => {
    // Function to fetch unique voters
    const fetchUniqueVoters = async () => {
      try {
        const res = await fetch(
          `${siteDomain}${webPort}/api/uniquevoters?phaseId=${selectedPhaseId}`,
        );
        const data = await res.json();

        // Count unique voters by getting the length of usernames array
        const uniqueVotersCount = data.usernames ? data.usernames.length : 0;

        setUniqueVoters(uniqueVotersCount);
      } catch (error) {
        console.error('Error fetching unique voters:', error);
      }
    };

    // Fetch unique voters when the component first renders and every time phaseId changes
    fetchUniqueVoters();
  }, [selectedPhaseId]);

  const sortedContributors = [...cntbtrs].sort(
    (a, b) => b.points_sum - a.points_sum,
  );
  const totalTokensAllocated = cntbtrs.reduce(
    (sum, contributor) => sum + (contributor.tokensAllocated || 0),
    0,
  );
  const formattedTotalTokensAllocated = totalTokensAllocated.toLocaleString();

  const handlePhaseChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPhaseId = parseInt(event.target.value);
    setSelectedPhaseId(newPhaseId);
  };

  return (
    <>
      <Header isLogged={isAuthenticated} />
      <div className="font-lexend bg-gradient-to-br from-dexterblue via-dextergreen to-dextermegagreen block justify-center items-center min-h-screen py-24 sm:py-32">
        <TopBanner />

        {/*        <div className="sm:mx-auto sm:w-full sm:max-w-sm pb-16"> */}

        <div className="sm:px-2 md:px-40 pb-16">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-black pt-20 pb-10">
            Community Contribution History
          </h2>
          <div className="px-2">
            <p className="text-black text-center">
              This history page tracks the community allocations from Phase 3
              onwards. To see the allocations for Phase 1 and Phase 2
              <Link
                className="underline"
                href={
                  'https://dexter-on-radix.gitbook.io/dexter/overview/how-are-contributors-rewarded/nomination-process'
                }
                target="_blank"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6 inline-block align-middle ml-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59"
                  />
                </svg>
                click here.
              </Link>
            </p>
          </div>
        </div>
        <div className="md:px-20 lg:px-40 sm:px-12 ">
          <div className="flex justify-between">
            <select
              value={selectedPhaseId ?? ''}
              onChange={handlePhaseChange}
              className="font-lexend font-semibold text-base my-2 py-2 text-gray-900"
            >
              <option>Select Phase</option>
              {phaseIds?.map((id) => (
                <option key={id} value={id}>{`Phase ${id}`}</option>
              ))}
            </select>

            <div className="flex items-center hover:underline text-black">
              <Link href={`${siteDomain}${webPort}/logs`}>
                {' '}
                <p className="font-semibold px-1k">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 inline mr-1 mb-1"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
                    />{' '}
                  </svg>
                  See voting logs
                </p>{' '}
              </Link>
            </div>
          </div>

          <table className="text-black md:w-full md:min-w-full font-lexend font-normal bg-bgdark divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th
                  style={{ maxWidth: '125px' }}
                  className="px-6 py-6 text-left lg:text-left sm:text-sm"
                >
                  Contributor
                </th>
                <th
                  style={{ maxWidth: '80px' }}
                  className="px-6 py-6 text-right sm:text-sm"
                >
                  Points
                </th>
                <th className="px-6 py-6 text-left lg:text-right sm:text-sm">
                  Tokens Allocated
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {sortedContributors.map((contributor, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td
                    style={{ overflow: 'hidden', maxWidth: '125px' }}
                    className="whitespace-nowrap px-6 py-4"
                  >
                    <span className="text-sm md:text-base font-normal">
                      {' '}
                      <div className="inline-flex items-center">
                        <Avatar
                          name={contributor.contributor_name.toString()}
                          width={30}
                          height={30}
                          marginRight={10}
                        />
                        {contributor.contributor_name}{' '}
                      </div>
                    </span>
                  </td>
                  <td
                    style={{ maxWidth: '80px' }}
                    className="whitespace-nowrap px-6 py-4 text-right"
                  >
                    {' '}
                    <span className="text-sm md:text-base font-normal">
                      {' '}
                      {Number(contributor.points_sum).toLocaleString(
                        undefined,
                        { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                      )}{' '}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <span className="text-sm md:text-base font-normal">
                      {' '}
                      {Number(contributor.tokensAllocated).toLocaleString(
                        undefined,
                        { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                      )}{' '}
                    </span>
                    <span className="text-sm"> DEXTR</span>{' '}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-white text-right">
              <tr>
                <th className="text-left pl-6">Total voters: {uniqueVoters}</th>
                <th>
                  <span className="font-lexend font-normal text-sm md:text-base  md:mr-5">
                    Contributors allocation:
                  </span>
                </th>
                <th className="px-6 py-2 text-sm md:text-base font-normal md:font-semibold">
                  {formattedTotalTokensAllocated}{' '}
                  <span className="text-sm md:text-base font-normal">
                    {' '}
                    DEXTR
                  </span>
                </th>
              </tr>
              <tr>
                <th></th>
                <th>
                  <span className="font-lexend font-normal text-sm md:text-base  md:mr-5">
                    Reserve Allocation:
                  </span>
                </th>
                <th className="px-6 py-2 text-sm md:text-base font-normal md:font-semibold">
                  {' '}
                  5,000{' '}
                  <span className="text-sm md:text-base font-normal">
                    {' '}
                    DEXTR
                  </span>{' '}
                </th>
              </tr>
              <tr>
                <th></th>
                <th>
                  {' '}
                  <span className="font-lexend font-normal text-sm md:text-base  md:mr-5">
                    Total Allocation:
                  </span>
                </th>
                <th className="px-6 py-2 text-sm md:text-base font-normal md:font-semibold">
                  100,000{' '}
                  <span className="text-sm md:text-base font-normal">
                    {' '}
                    DEXTR
                  </span>
                </th>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="h-4" />

        <div className="flex justify-center items-center my-6">
          <Link href={`${siteDomain}${webPort}/results`}>
            {' '}
            <button
              type="button"
              className="font-lexend font-semibold bg-transparent hover:bg-black text-black font-semibold hover:text-white py-2 px-4 border-2 border-black hover:border-transparent"
            >
              See Ongoing Phase Results
            </button>{' '}
          </Link>
        </div>

        {/* <span className="text-sm md:text-base font-normal">  */}
      </div>
    </>
  );
};

export default History;
