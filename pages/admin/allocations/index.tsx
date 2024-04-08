import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { wsPort, webPort, siteDomain } from '../../../config';
import Avatar from '../../../components/Avatar';

type Contributor = {
  contributor_name: string;
  points_sum: number;
  tokensAllocated: number;
  phase_id: number;
  wallet: string;
};

type AllocationsProps = {
  contributors: Contributor[];
  phaseId: number | null; // Allow phaseId to be null
};

export const getServerSideProps: GetServerSideProps<AllocationsProps> = async (
  context,
) => {
  const { req, query } = context;
  const { cookies } = req;

  const isAdminAuthenticated = cookies.adminToken === 'admin-token-value';

  // If the admin is already authenticated, redirect to dashboard
  if (!isAdminAuthenticated) {
    return {
      redirect: {
        destination: '/admin',
        permanent: false,
      },
    };
  }

  const phaseId = parseInt(query.phaseId as string, 10) || null; // Parse phaseId from query string, fallback to null if not provided

  // Fetch data for the selected phaseId

  const res = await fetch(
    `${siteDomain}${webPort}/api/contributors-history?phaseId=${phaseId}`,
  );
  const data = await res.json();
  const contributors = data.contributors || [];

  return { props: { contributors, phaseId } };
};

const Allocations: React.FC<AllocationsProps> = ({ contributors, phaseId }) => {
  const [selectedPhaseId, setSelectedPhaseId] = useState(phaseId || null);

  // Fetch phase IDs OLD
  // useEffect(() => {
  //   const fetchSmallestPhaseId = async () => {
  //     try {
  //       const res = await fetch(
  //         `${siteDomain}${webPort}/api/contributors-historysmallest-phase`,
  //       );
  //       const data = await res.json();
  //       setSelectedPhaseId(data.smallestPhaseId || 1); // set to 1 if smallestPhaseId is null
  //     } catch (error) {
  //       console.error(error);
  //       setSelectedPhaseId(1);
  //     }
  //   };

  //   if (!phaseId) {
  //     fetchSmallestPhaseId();
  //   }
  // }, [phaseId]);

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

  // Fetch phase IDs OLD
  // useEffect(() => {
  //   const fetchPhaseIds = async () => {
  //     const res = await fetch(`${siteDomain}${webPort}/api/all-phases`);
  //     const data = await res.json();
  //     setPhaseIds(data.phaseIds);
  //   };
  //   fetchPhaseIds();
  // }, []);

  //NEW

  useEffect(() => {
    const fetchPhaseIds = async () => {
      const res = await fetch(`${siteDomain}${webPort}/api/all-phases`);
      const data = await res.json();

      // Sort the phaseIds array in ascending order to get the earliest phase first
      // const sortedPhaseIds = data.phaseIds.sort(
      //   (a: number, b: number) => b - a,
      // );

      // Check if data.phaseIds exists before calling sort on it
      const sortedPhaseIds = data.phaseIds
        ? data.phaseIds.sort((a: number, b: number) => b - a)
        : [];

      // Set the initial selectedPhaseId to the first phase ID in the sorted array
      setSelectedPhaseId(sortedPhaseIds[0]);

      setPhaseIds(sortedPhaseIds);
    };
    fetchPhaseIds();
  }, []);

  //NEW

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

  const handleLogout = () => {
    fetch(`${siteDomain}${webPort}/api/adminLogout`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(() => {
        window.location.href = '/admin'; // Redirect to login page
      })
      .catch((err) => console.error(err));
  };

  return (
    <>
      <div className="text-black bg-gradient-to-br from-dexterblue via-dextergreen to-dextermegagreen justify-center items-center min-h-screen lg:px-10 py-40 sm:px-2 md:px-10 box-border">
        <div className="lg:px-40 flex flex-row-reverse items-center mb-10 mr-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
            />
          </svg>
          <button
            onClick={handleLogout}
            className="px-3 py-2 font-lexend font-semibold center cursor-pointer"
          >
            Logout
          </button>

          <Link href={`${siteDomain}${webPort}/admin/allocations`}>
            {' '}
            <p className='className="mx-5 px-3 py-2 font-lexend font-semibold center cursor-pointer'>
              {' '}
              Allocations{' '}
            </p>
          </Link>

          <Link href={`${siteDomain}${webPort}/admin/nomin`}>
            {' '}
            <p className='className="mx-5 px-3 py-2 font-lexend font-semibold center cursor-pointer'>
              {' '}
              Nominations{' '}
            </p>
          </Link>

          <Link href={`${siteDomain}${webPort}/admin/logs`}>
            {' '}
            <p className='className="mx-5 px-3 py-2 font-lexend font-semibold center cursor-pointer'>
              {' '}
              Logs{' '}
            </p>
          </Link>

          <Link href={`${siteDomain}${webPort}/admin/dashboard`}>
            {' '}
            <p className='className="mx-5 px-3 py-2 font-lexend font-semibold center cursor-pointer'>
              {' '}
              Admin{' '}
            </p>
          </Link>
        </div>
        <div className="md:px-10 lg:px-20 sm:px-12 mt-20 ">
          <h2 className="text-2xl text-center font-lexend font-semibold mb-4">
            Allocations
          </h2>

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

          <table className="text-black md:w-full md:min-w-full font-lexend font-normal bg-bgdark divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th
                  style={{ maxWidth: '125px' }}
                  className="px-6 py-6 text-left lg:text-left sm:text-sm"
                >
                  Contributor
                </th>
                <th className="px-6 py-6 text-left sm:text-sm">Tokens</th>
                <th
                  style={{ maxWidth: '400px' }}
                  className="px-6 py-6 text-left sm:text-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-6 h-6  inline-block align-middle"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
                    />
                  </svg>
                  Copy Wallet
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
                  <td className="whitespace-nowrap px-6 py-4 text-left">
                    <span className="text-sm md:text-base font-normal">
                      {' '}
                      {Number(contributor.tokensAllocated).toLocaleString(
                        undefined,
                        { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                      )}{' '}
                    </span>{' '}
                  </td>

                  <td
                    style={{ overflow: 'hidden', maxWidth: '800px' }}
                    className="whitespace-nowrap px-6 py-4 text-left"
                  >
                    <span
                      className="text-sm md:text-base  font-normal cursor-pointer"
                      onClick={() => {
                        navigator.clipboard
                          .writeText(contributor.wallet)
                          .then(() => {
                            toast.success('Wallet copied!');
                          })
                          .catch((err) => {
                            console.error('Failed to copy wallet: ', err);
                          });
                      }}
                    >
                      {contributor.wallet}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot className="bg-white text-left ">
              <tr>
                <th>
                  <span className="ml-6 font-lexend font-normal text-sm md:text-base  md:mr-5">
                    Contributors allocation:
                  </span>
                </th>
                <th className="px-6 py-2 text-sm md:text-base font-normal md:font-semibold">
                  {formattedTotalTokensAllocated}{' '}
                </th>
                <th></th>
              </tr>
              <tr>
                <th>
                  <span className="ml-6 font-lexend font-normal text-sm md:text-base  md:mr-5">
                    Reserve Allocation:
                  </span>
                </th>
                <th className="px-6 py-2 text-sm md:text-base font-normal md:font-semibold">
                  {' '}
                  5,000{' '}
                </th>
                <th
                  className="font-normal cursor-pointer px-6 py-4"
                  onClick={() => {
                    navigator.clipboard
                      .writeText(
                        'rdx1qsp8r42gmza2cpvdekpffv24y4fze22rnk2e37krjcqhdvc3vp5reysvadxtr',
                      )
                      .then(() => {
                        toast.success('Wallet copied!');
                      })
                      .catch((err) => {
                        console.error('Failed to copy wallet: ', err);
                      });
                  }}
                >
                  rdx1qsp8r42gmza2cpvdekpffv24y4fze22rnk2e37krjcqhdvc3vp5reysvadxtr
                </th>
              </tr>
              <tr>
                <th>
                  {' '}
                  <span className="ml-6 font-lexend font-normal text-sm md:text-base  md:mr-5">
                    Total Allocation:
                  </span>
                </th>
                <th className="px-6 py-2 text-sm md:text-base font-normal md:font-semibold">
                  100,000{' '}
                </th>
                <th></th>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="h-4" />
      </div>
    </>
  );
};

export default Allocations;
