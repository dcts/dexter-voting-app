import { useState, useEffect } from 'react';
import { useRouter } from 'next/router'; // Import useRouter for programmatic navigation
import { wsPort, webPort, siteDomain } from '../../config';
import React from 'react';

import Header from '../../components/Header';
import Avatar from '../../components/Avatar';
import Link from 'next/link';

interface Nomination {
  nomination: string;
  reason: string;
  phase: number;
}

export default function NominationsPage() {
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [phases, setPhases] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Add this line

  // Router for navigation
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/nominations', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Cookie: 'userToken=user-token-value', // Assuming the token is known and static
          },
        });

        if (res.status === 401) {
          // If unauthorized
          router.push('/login'); // Redirect to login
          setIsAuthenticated(false); // User is not authenticated
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
        setIsAuthenticated(true); // User is authenticated
      } catch (err) {
        console.error(err);
        setLoading(false);
        setIsAuthenticated(false); // User is not authenticated
      }
    };

    fetchData();
  }, [router]);  // Add router to the dependency array

  
  const handlePhaseChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPhase(Number(event.target.value) || null);
  };

  //   if (loading) {
  //     return <div>Loading...</div>;
  //   }

  const sortedNominations = selectedPhase
    ? nominations.filter((nomination) => nomination.phase === selectedPhase)
    : nominations;

  return (
    <>
      <Header isLogged={isAuthenticated} />
      <div className="font-lexend bg-gradient-to-br from-dexterblue via-dextergreen to-dextermegagreen block justify-center items-center min-h-screen py-24 sm:py-32">
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

            <div className="flex items-center">
              <Link href={`${siteDomain}${webPort}/nominate`}>
                {' '}
                <p className="font-semibold px-1 hover:underline text-black">
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
                      d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Nominate someone
                </p>{' '}
              </Link>
            </div>
          </div>

          <table className="text-black md:w-full md:min-w-full font-lexend font-normal bg-bgdark divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-6 py-6 w-1/2">Nomination</th>
                <th className="px-6 py-6 w-1/2">Contribution</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
