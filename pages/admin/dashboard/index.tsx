import { GetServerSideProps } from 'next';
import {
  createColumnHelper,
  flexRender,
  useReactTable,
  getCoreRowModel,
  ColumnDef,
} from '@tanstack/react-table';
import { useState } from 'react';
import Link from 'next/link';
import { wsPort, webPort, siteDomain } from '../../../config';

import Avatar from '../../../components/Avatar';

type Contributor = {
  id: number;
  name: string;
  skills: string;
  wallet: string;
};

type DashboardProps = {
  contributors: Contributor[];
  activePhase: number | null;
};

export const getServerSideProps: GetServerSideProps<DashboardProps> = async (
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

  const resPhase = await fetch(`${siteDomain}${webPort}/api/phase-control`);
  const dataPhase = await resPhase.json();
  const activePhase = dataPhase.activePhase || null;

  const res = await fetch(`${siteDomain}${webPort}/api/conlist`);
  const data = await res.json();

  const contributors = data.conlist || [];

  return { props: { contributors, activePhase } };
};

const Dashboard: React.FC<DashboardProps> = ({ contributors, activePhase }) => {
  const [isVotingActive, setIsVotingActive] = useState<boolean>(
    activePhase !== null,
  );
  const [phaseNumber, setPhaseNumber] = useState<number | null>(activePhase);

  const [newContributorName, setNewContributorName] = useState('');
  const [newContributorSkills, setNewContributorSkills] = useState('');
  const [newContributorWallet, setNewContributorWallet] = useState('');

  const handleAddContributor = async () => {
    try {
      const res = await fetch(`${siteDomain}${webPort}/api/conlist`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newContributorName,
          skills: newContributorSkills,
          wallet: newContributorWallet,
        }),
      });

      if (!res.ok) throw new Error(res.statusText);

      const data = await res.json();
      setData((prevState) => [
        ...prevState,
        {
          id: data.insertId,
          name: newContributorName,
          skills: newContributorSkills,
          wallet: newContributorWallet,
        },
      ]);

      // Reset form fields
      setNewContributorName('');
      setNewContributorSkills('');
      setNewContributorWallet('');
    } catch (error) {
      console.error('Failed to add the contributor: ', error);
    }
  };

  const columnHelper = createColumnHelper<Contributor>();

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${siteDomain}${webPort}/api/conlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    //  console.log('DELETE');
      // console.log(res);
      if (!res.ok) throw new Error(res.statusText);

      // Remove the contributor from the state
      setData(data.filter((contributor) => contributor.id !== id));
    } catch (error) {
      console.error('Failed to delete the contributor: ', error);
    }
  };

  const startVotingPhase = async () => {
    try {
      const res = await fetch(`${siteDomain}${webPort}/api/phase-control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phaseNumber, phaseAction: 'start' }),
      });

      if (!res.ok) throw new Error(res.statusText);

      const data = await res.json();
      //console.log(data);
      setIsVotingActive(true);
    } catch (error) {
      console.error('Failed to start the nomination phase: ', error);
    }
  };

  const stopVotingPhase = async () => {
    try {
      const res = await fetch(`${siteDomain}${webPort}/api/phase-control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phaseNumber, phaseAction: 'stop' }),
      });

      if (!res.ok) throw new Error(res.statusText);

      const data = await res.json();
     // console.log(data);
      setIsVotingActive(false);
      setPhaseNumber(null);
    } catch (error) {
      console.error('Failed to stop the nomination phase: ', error);
    }
  };

  const columns: ColumnDef<Contributor, any>[] = [
    columnHelper.accessor('name', {
      header: 'Telegram Username',
      cell: (info) => (
        <div className="inline-flex items-center">
          <Avatar
            name={info.getValue()}
            width={25}
            height={25}
            marginRight={5}
            marginLeft={5}
          />
          {info.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor('skills', {
      header: 'Skills',
      cell: (info) => info.getValue(),
    }),
    // columnHelper.accessor("wallet", {
    //   header: "Wallet",
    //   cell: info => info.getValue(),
    // }),
    {
      id: 'delete',
      header: () => <div className="text-right">Delete Contributor</div>,
      cell: (
        { row }: any, // Change CellProps<Contributor> to any for now
      ) => (
        <div className="flex justify-end">
          <button
            className="bg-red-500 text-white px-2 py-1   hover:bg-red-600"
            onClick={() => handleDelete(row.original.id)}
          >
            Delete {row.original.id}
          </button>
        </div>
      ),
    },
  ];

  const [data, setData] = useState(() =>
    contributors ? [...contributors] : [],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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
    <div className="text-black bg-gradient-to-br from-dexterblue via-dextergreen to-dextermegagreen justify-center items-center min-h-screen lg:px-20 py-40 sm:px-10 md:px-10 box-border">
      <div className="flex flex-row-reverse items-center mb-10 mr-40">
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

      <div className="bg-transparent pb-4">
        <div
          className={`drop-shadow-xl w-full h-10   flex items-center justify-center ${
            isVotingActive ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          <p className="font-lexend font-semibold text-white text-center">
            {isVotingActive
              ? `Nomination Phase ${phaseNumber} has started`
              : 'Nominations have ended'}
          </p>
        </div>
      </div>
      <div>
        <div className="mb-4 w-full drop-shadow-2xl border-2 border-black p-10 2xl:mr-10">
          <h2 className="text-2xl font-lexend font-semibold mb-4">
            Start/End Nomination Phases
          </h2>
          <div className="font-lexend font-normal mt-4 md:flex items-center md:space-x-2">
            <input
              type="number"
              className="p-2 border border-gray-300"
              placeholder="Phase number"
              onChange={(e) => setPhaseNumber(Number(e.target.value))}
            />
            <button
              className="md:my-0 my-2 bg-green-500 text-white px-4 py-2 font-lexend font-semibold hover:bg-green-300"
              onClick={startVotingPhase}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6  inline-block align-middle mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                />
              </svg>
              Start Phase
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 font-lexend font-semibold hover:bg-red-300"
              onClick={stopVotingPhase}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6 inline-block align-middle mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Stop Phase
            </button>
          </div>
        </div>

        <div className="mb-4 w-full drop-shadow-2xl border-2 border-black p-10 2xl:mr-10">
          <h2 className="font-lexend font-semibold text-2xl font-bold mb-4">
            Add a new contributor
          </h2>
          <div className="md:flex items-center md:space-x-2">
            <input
              type="text"
              className="p-2 border border-gray-300 min-w-[300px]"
              placeholder="Telegram username"
              value={newContributorName}
              onChange={(e) => setNewContributorName(e.target.value)}
            />
            <input
              type="text"
              className="p-2 border border-gray-300 md:my-0 my-2 min-w-[300px]"
              placeholder="List Skills with commas"
              value={newContributorSkills}
              onChange={(e) => setNewContributorSkills(e.target.value)}
            />
          </div>
          <div>
            <input
              type="text"
              className="p-2 border border-gray-300 min-w-[300px]"
              placeholder="Radix Wallet"
              value={newContributorWallet}
              onChange={(e) => setNewContributorWallet(e.target.value)}
            />

            <button
              className="mt-2 md:ml-2 bg-green-500 text-white px-4 py-2 font-lexend font-semibold hover:bg-green-300"
              onClick={handleAddContributor}
            >
              + Add New Contributor
            </button>
          </div>
        </div>
      </div>

      <div className="font-lexend font-normal mt-10">
        <h2 className="text-2xl font-lexend font-semibold mb-4">
          Contributors
        </h2>

        <table className="w-full min-w-full divide-y divide-gray-200">
          {/* <table className="text-black md:w-full md:min-w-full lg:w-1/2 font-lexend font-normal bg-bgdark divide-y divide-gray-200"> */}

          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-6 py-3">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {table.getRowModel().rows.map((row, idx) => (
              <tr key={row.id} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="whitespace-nowrap px-6 py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
