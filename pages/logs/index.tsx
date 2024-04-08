import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { GetServerSideProps } from 'next';

import { wsPort, webPort, siteDomain } from '../../config';

import Avatar from '../../components/Avatar';
import Header from '../../components/Header';

type AdminLog = {
  id: number;
  username: string;
  contributor_name: string;
  points: number;
  phase_id: number;
};

type AdminProps = {
  isAuthenticated: boolean; // add this line
};

export const getServerSideProps: GetServerSideProps<AdminProps> = async (
  context,
) => {
  const { req } = context;
  const { cookies } = req;

  const isAuthenticated = cookies.userToken === 'user-token-value';

  if (!isAuthenticated) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  let activePhase = null;
  try {
    const resPhase = await fetch(`${siteDomain}${webPort}/api/phase-control`);
    const dataPhase = await resPhase.json();
    activePhase = dataPhase.activePhase || null;
  } catch (error) {
    console.error('Error fetching active phase:', error);
  }

  const res = await fetch(`${siteDomain}${webPort}/api/conlist`);
  const data = await res.json();

  const contributors = data.conlist || null; // Use null if data.conlist is undefined

  return { props: { contributors, activePhase, isAuthenticated } };
};

const LogPage: React.FC<AdminProps> = ({ isAuthenticated }) => {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState('1');
  const [phases, setPhases] = useState<number[]>([]); // new state variable for the phases

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    const res = await fetch(
      `${siteDomain}${webPort}/api/logs?phase_id=${selectedOption}`,
    );
    const data = await res.json();
    console.log('Data from API:', data);

    //
    // TO SORT
    //

    if (Array.isArray(data.adminLogs)) {
      // Sort the adminLogs array by id in ascending order before setting it to logs
      const sortedLogs = data.adminLogs.sort(
        (a: AdminLog, b: AdminLog) => a.id - b.id,
      );
      setLogs(sortedLogs);
    } else {
      console.error('Data from API is not an array');
    }
    setIsLoading(false);
  }, [selectedOption]);

  //
  // TO SORT
  //

  useEffect(() => {
    fetchLogs();
  }, [selectedOption, fetchLogs]); // added fetchLogs here

  useEffect(() => {
    fetchLogs();
  }, [selectedOption, fetchLogs]); // include fetchLogs as a dependency here as well

  //
  // STAR DROPDOWN FROM OLDEST PHASE
  //

  useEffect(() => {
    const fetchPhases = async () => {
      const res = await fetch(`${siteDomain}${webPort}/api/all-phases`);
      const data = await res.json();
      setPhases(data.phaseIds);
    };

    fetchPhases();
  }, []);

  //
  // STAR DROPDOWN FROM OLDEST PHASE
  //

  useEffect(() => {
    const fetchPhases = async () => {
      try {
        const res = await fetch(`${siteDomain}${webPort}/api/all-phases`);
        if (res.ok) {
          const data = await res.json();
          let sortedPhaseIds = [];
          if (data.phaseIds) {
            // Sort the phaseIds array in descending order to get the newest phase first
            sortedPhaseIds = data.phaseIds.sort(
              (a: number, b: number) => b - a,
            );
          } else {
            console.error('Error: data.phaseIds is undefined');
          }
          // Set the initial selectedOption to the first (newest) phase ID in the sorted array
          // If sortedPhaseIds is empty, selectedOption will be set to '1'
          setSelectedOption(sortedPhaseIds[0] || '1');
          setPhases(sortedPhaseIds);
        } else {
          console.error(`Error: server returned status ${res.status}`);
        }
      } catch (error) {
        console.error('An error occurred while fetching the phases:', error);
      }
    };

    fetchPhases();
  }, []);

  //
  // STAR DROPDOWN FROM EARLIEST PHASE
  //

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(e.target.value);
  };

  return (
    <>
      <Header isLogged={isAuthenticated} />
      <div className="bg-gradient-to-br from-dexterblue via-dextergreen to-dextermegagreen block justify-center items-center min-h-screen py-24 sm:py-32 font-lexend">
        <div className="text-black justify-center items-center min-h-screen lg:px-60 py-40 sm:px-10 md:px-10 box-border">
          <div className="flex flex-row-reverse items-center mb-1"></div>

          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="md:px-20 lg:px-40 sm:px-12 mt-20 ">
              <h2 className="text-2xl text-center font-lexend font-semibold mb-4">
                Voting Logs
              </h2>

              <div className="flex justify-between">
                <select
                  className="font-lexend font-semibold text-base my-2 py-2 text-gray-900"
                  onChange={handleSelectChange}
                  value={selectedOption}
                >
                  {phases && // check if phases is defined before calling map
                    phases.map((id) => (
                      <option key={id} value={id}>{`Phase ${id}`}</option>
                    ))}
                </select>

                <div className="flex items-center hover:underline">
                  <Link href={`${siteDomain}${webPort}/history`}>
                    {' '}
                    <p className="font-semibold px-1">
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
                          d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5"
                        />
                      </svg>
                      See history
                    </p>{' '}
                  </Link>
                </div>
              </div>

              <table className="text-black md:w-full md:min-w-full font-lexend font-normal bg-bgdark divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-6 text-left lg:text-left sm:text-sm">
                      TG Username
                    </th>
                    <th className="px-6 py-6 text-left lg:text-left sm:text-sm">
                      Voted for
                    </th>
                    <th className="px-6 py-6 text-right sm:text-sm">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {Array.isArray(logs) ? (
                    logs.map((log) => (
                      <tr key={log.id}>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="text-sm md:text-base font-normal">
                            <div className="inline-flex items-center">
                              <Avatar
                                name={log.username}
                                width={25}
                                height={25}
                                marginRight={5}
                                marginLeft={5}
                              />
                              {log.username}{' '}
                            </div>
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="text-sm md:text-base font-normal">
                            <div className="inline-flex items-center">
                              <Avatar
                                name={log.contributor_name}
                                width={25}
                                height={25}
                                marginRight={5}
                                marginLeft={5}
                              />
                              {log.contributor_name}{' '}
                            </div>
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right max-w[100px]">
                          <span className="text-sm md:text-base font-normal">
                            {log.points}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4}>There was an error fetching the data.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          <div className="h-4" />
        </div>
      </div>
    </>
  );
};

export default LogPage;
