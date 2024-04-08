import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router'; // Import useRouter for programmatic navigation
import { GetServerSideProps } from 'next'; // Import GetServerSideProps for server-side rendering
import { wsPort, webPort, siteDomain } from '../../../config';
import React from 'react';
import Avatar from '../../../components/Avatar';
import Link from 'next/link';
interface Nomination {
  id: number;
  nomination: string;
  reason: string;
  phase: number;
}
type NominationsPageProps = {};
export const getServerSideProps: GetServerSideProps<
  NominationsPageProps
> = async (context) => {
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
  return { props: {} };
};
export default function NominationsPage() {
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [phases, setPhases] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null);
  const router = useRouter(); // Router for navigation
  const deleteLog = async (id: number): Promise<void> => {
    try {
      const response = await fetch(
        `${siteDomain}${webPort}/api/nominationsadmin?id=${id}`,
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
  // define a new function to fetch nominations
  const fetchNominations = useCallback(async () => {
    try {
      const res = await fetch('/api/nominationsadmin', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Cookie: 'userToken=user-token-value', // Assuming the token is known and static
        },
      });
      if (res.status === 401) {
        // If unauthorized
        router.push('/admin'); // Redirect to admin page
        return;
      }
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      // Sort nominations by phase
      const sortedNominations = data.nominations.sort(
        (a: Nomination, b: Nomination) => a.phase - b.phase,
      );
      setNominations(sortedNominations);
      setPhases(data.phases);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [router]); // Assuming router is a dependency of fetchNominations

  useEffect(() => {
    fetchNominations();
  }, [fetchNominations]);


  const handleDelete = async (id: number) => {
    await deleteLog(id);
    alert(`Entry with ID ${id} has been deleted.`); // Notify the user
    fetchNominations(); // call the new function here to fetch updated nominations
  };
  const handlePhaseChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPhase(Number(event.target.value) || null);
  };
  const sortedNominations = selectedPhase
    ? nominations.filter((nomination) => nomination.phase === selectedPhase)
    : nominations;
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
        <div className="md:px-20 lg:px-40 sm:px-12 ">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-black pt-20 pb-10">
            Nominations Table
          </h2>

          <div className="flex justify-between">
            <select
              value={selectedPhase ?? ''}
              onChange={handlePhaseChange}
              className="font-lexend font-semibold text-base my-2 py-2 text-gray-900"
            >
              <option value="">All Phases</option>
              {phases.map((phase) => (
                <option key={phase} value={phase}>
                  Phase {phase}
                </option>
              ))}
            </select>

            <div className="flex items-center"></div>
          </div>

          <table className="text-black md:w-full md:min-w-full font-lexend font-normal bg-bgdark divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-6 py-6 w-1/2">Nomination</th>
                <th className="px-6 py-6 w-1/2">Contribution</th>
                <th className="px-6 py-6 w-1/2 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {sortedNominations.map((nomination, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="px-6 py-4">
                    <span className="text-sm md:text-base font-normal">
                      <div className="inline-flex items-center">
                        <Avatar
                          name={nomination.nomination.toString()}
                          width={30}
                          height={30}
                          marginRight={10}
                        />
                        {nomination.nomination}
                      </div>
                    </span>
                  </td>

                  <td className="px-6 py-4 break-words">
                    <span className="text-sm md:text-base font-normal">
                      {nomination.reason.split('\n').map((line, i) => (
                        <React.Fragment key={i}>
                          {line}
                          <br />
                        </React.Fragment>
                      ))}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      className="bg-red-500 text-white px-2 py-1 hover:bg-red-600"
                      onClick={() => handleDelete(nomination.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
