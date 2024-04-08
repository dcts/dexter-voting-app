import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { GetServerSideProps } from 'next';

import { wsPort, webPort, siteDomain } from '../../../config';

import Avatar from '../../../components/Avatar';

type AdminLog = {
  id: number;
  username: string;
  contributor_name: string;
  points: number;
  phase_id: number;
};

export const deleteLog = async (id: number): Promise<void> => {
  try {
    const response = await fetch(
      `${siteDomain}${webPort}/api/adminlog?id=${id}`,
      {
        method: 'DELETE',
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('An error occurred while deleting the log.', error);
  }
};

type AdminProps = {};

export const getServerSideProps: GetServerSideProps<AdminProps> = async (
  context,
) => {
  const { req } = context;
  const { cookies } = req;

  const isAdminAuthenticated = cookies.adminToken === 'admin-token-value';

  if (!isAdminAuthenticated) {
    return {
      redirect: {
        destination: '/admin',
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

  return { props: { contributors, activePhase } };
};

const AdminLogPage: React.FC<AdminProps> = () => {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState('1');
  const [phases, setPhases] = useState<number[]>([]); // new state variable for the phases

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    const res = await fetch(
      `${siteDomain}${webPort}/api/adminlog?phase_id=${selectedOption}`,
    );
    const data = await res.json();
    //console.log('Data from API:', data);

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

  const handleDelete = async (id: number) => {
    await deleteLog(id);
    alert(`Entry with ID ${id} has been deleted.`); // Notify the user
    await fetchLogs();
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedOption, fetchLogs]); // include fetchLogs as a dependency here as well

  useEffect(() => {
    const fetchSmallestPhase = async () => {
      try {
        const res = await fetch(`${siteDomain}${webPort}/api/smallest-phase`);
        const data = await res.json();
        setSelectedOption(data.smallestPhaseId || '1'); // set to '1' if smallestPhaseId is null
      } catch (error) {
        console.error(error);
        setSelectedOption('1');
      }
    };

    fetchSmallestPhase();
  }, []);

  //
  // STAR DROPDOWN FROM EARLIEST PHASE
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
    <div className="text-black bg-gradient-to-br from-dexterblue via-dextergreen to-dextermegagreen justify-center items-center min-h-screen lg:px-60 py-40 sm:px-10 md:px-10 box-border">
      <div className="flex flex-row-reverse items-center mb-1">
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

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="md:px-20 lg:px-40 sm:px-12 mt-20 ">
          <h2 className="text-2xl text-center font-lexend font-semibold mb-4">
            Voting Logs
          </h2>

          <select
            className="font-lexend font-semibold text-base my-2 py-2 text-gray-900"
            onChange={handleSelectChange}
            value={selectedOption}
          >
            {phases.map((id) => (
              <option key={id} value={id}>{`Phase ${id}`}</option>
            ))}
          </select>

          <table className="text-black md:w-full md:min-w-full font-lexend font-normal bg-bgdark divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-6 py-6 text-left lg:text-left sm:text-sm">
                  TG Username
                </th>
                <th className="px-6 py-6 text-left lg:text-left sm:text-sm">
                  Voted for
                </th>
                <th className="px-6 py-6 text-left lg:text-left sm:text-sm">
                  Points
                </th>
                <th className="px-6 py-6 text-left lg:text-left sm:text-sm">
                  Delete
                </th>
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
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="text-sm md:text-base font-normal">
                        {log.points}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <button
                        className="bg-red-500 text-white px-2 py-1   hover:bg-red-600"
                        onClick={() => handleDelete(log.id)} // call handleDelete here, not deleteLog
                      >
                        Delete
                      </button>
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
  );
};

export default AdminLogPage;
