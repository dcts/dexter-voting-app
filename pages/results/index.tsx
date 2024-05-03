import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Header from '../../components/Header';
import Link from 'next/link';
import TopBanner from '../../components/TopBanner';
import toast from 'react-hot-toast';
import { wsPort, webPort, siteDomain } from '../../config';
import Avatar from '../../components/Avatar';

type Contributor = {
  contributor_name: string;
  points_sum: number;
  tokensAllocated: number;
  phase_id: number;
};

type ResultsProps = {
  contributors: Contributor[];
  phaseId: number | null; // Allow phaseId to be null
  isAuthenticated: boolean; // add this line
};

export const getServerSideProps: GetServerSideProps<ResultsProps> = async (
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

  const res = await fetch(`${siteDomain}${webPort}/api/contributors`);
  const data = await res.json();

  const contributors = data.contributors || [];
  const phaseId = data.phaseId || null; // Set phaseId to null if it is undefined

  return { props: { contributors, phaseId, isAuthenticated } };
};

const Results: React.FC<ResultsProps> = ({
  contributors: initialContributors,
  phaseId: initialPhaseId,
  isAuthenticated,
}) => {
  // Declare state variables for contributors and phaseId
  const [contributors, setContributors] =
    useState<Contributor[]>(initialContributors);
  const [phaseId, setPhaseId] = useState<number | null>(initialPhaseId);

  const [uniqueVoters, setUniqueVoters] = useState<string[]>([]); // Add state for unique voters

  // HIDE ALL CONSOLE ERROR FOR PRODUCTION
  console.error = () => {};

  const sortedContributors = [...contributors].sort(
    (a, b) => b.points_sum - a.points_sum,
  );

  const phase22orLater = phaseId && phaseId >= 22;
  // For all contributor allocations starting at phase 22, reduce contributor total rewards from 95 to 65k DEXTR.
  const contributorAllocationFix = phase22orLater ? 65 / 95 : 1;
  const totalTokensAllocated =
    contributors.reduce(
      (sum, contributor) => sum + (contributor.tokensAllocated || 0),
      0,
    ) * contributorAllocationFix; // fix contributor token allocation

  const formattedTotalTokensAllocated = totalTokensAllocated.toLocaleString();

  const wsUri = 'wss://dexternominations.space';
  const [wsData, setWsData] = useState<any>(null);

  // Function to handle the received message
  const handleMessageReceived = (message: string | Blob) => {
    if (typeof message === 'string') {
      // Handle the message if it's a string
      // console.log('Handling message:', message);
      try {
        const jsonMessage = JSON.parse(message);
        // console.log('Parsed JSON:', jsonMessage);
        if (
          jsonMessage['command'] &&
          jsonMessage['command'] === 'data_reload'
        ) {
          reloadResultsData();

          toast.success('New vote!');
        } else {
          // toastr.info(jsonMessage['message']);
          // console.log(jsonMessage['message']);
        }

        // Handle jsonMessage here...
      } catch (error) {
        // console.error("Error parsing JSON:", error);
      }
    } else if (message instanceof Blob) {
      // Handle the message if it's a Blob
      // console.log("Received Blob message:", message);

      // Assuming you want to handle it as text, you can use the FileReader API to read the Blob as text
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        // console.log("Text from Blob:", text);

        try {
          const jsonMessage = JSON.parse(text);
          // console.log("Parsed JSON from Blob:", jsonMessage);
          // Handle jsonMessage here...
        } catch (error) {
          // console.error("Error parsing JSON from Blob:", error);
        }
      };
      reader.readAsText(message);
    }
  };

  useEffect(() => {
    // Connect to WebSocket
    const ws = new WebSocket(wsUri);

    // Event listener for WebSocket 'open' event
    ws.onopen = (event) => {
      console.log('Connected to WebSocket server');
    };

    // Event listener for WebSocket 'message' event
    ws.onmessage = (event) => {
      const message = event.data;
      // console.log("Received message:", message);
      // Perform any additional actions based on the received message
      // For example, update state or trigger other functions
      // Update wsData state with the received message
      setWsData(message);
      // Call a function or perform an action when a message is received
      handleMessageReceived(message);
      // console.log('MESSAGE');
      // console.log(message);
    };

    // Event listener for WebSocket 'close' event
    ws.onclose = (event) => {
      console.log('Disconnected from WebSocket server');
    };

    // Event listener for WebSocket 'error' event
    ws.onerror = (event) => {
      console.error('WebSocket error:', event);
    };

    // Cleanup logic when the component unmounts
    return () => {
      ws.close();
    };
  });

  // Function to reload results data
  const reloadResultsData = async () => {
    try {
      const res = await fetch(`${siteDomain}${webPort}/api/contributors`);
      const data = await res.json();
      const newContributors = data.contributors || [];
      const newPhaseId = data.phaseId || null;
      //alert('RELOAD');
      // Update the state with the new data using functional updates
      setWsData(null); // Clear the previous WebSocket data
      setContributors(newContributors); // Update contributors state
      setPhaseId(newPhaseId); // Update phaseId state
    } catch (error) {
      console.error('Error reloading results data:', error);
    }
  };

  useEffect(() => {
    // Function to fetch unique voters
    const fetchUniqueVoters = async () => {
      try {
        const res = await fetch(
          `${siteDomain}${webPort}/api/uniquevoters?phaseId=${phaseId}`,
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
  }, [phaseId]);

  return (
    <>
      <Header isLogged={isAuthenticated} />
      <div className="bg-gradient-to-br from-dexterblue via-dextergreen to-dextermegagreen block justify-center items-center min-h-screen py-24 sm:py-32 font-lexend">
        <TopBanner />

        <div className="sm:mx-auto sm:w-full sm:max-w-sm pb-16">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-black pt-20 pb-2">
            Community Contribution Results
          </h2>
          <p className="text-black font-lexend font-semibold text-base pb-4 text-center">
            Current Nomination Phase:{' '}
            <span className="text-xl"> {phaseId}</span>
          </p>
        </div>
        <div className="md:px-20 lg:px-40 sm:px-12 ">
          <div className="text-right my-2">
            <Link href={`${siteDomain}${webPort}/logs`}>
              {' '}
              <p className="font-semibold px-1 text-black hover:underline">
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

          <table className="text-black font-lexend font-normal bg-bgdark w-full min-w-full divide-y divide-gray-200">
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
                      {Number(
                        contributor.tokensAllocated * contributorAllocationFix,
                      ).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{' '}
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
                    Liquidity Incentives:
                  </span>
                </th>
                <th className="px-6 py-2 text-sm md:text-base font-normal md:font-semibold">
                  {' '}
                  20,000{' '}
                  <span className="text-sm md:text-base font-normal">
                    {' '}
                    DEXTR
                  </span>{' '}
                </th>
              </tr>
              <tr>
                <th></th>
                <th>
                  <span className="font-lexend font-normal text-sm md:text-base  md:mr-5">
                    Validator Node Stakers:
                  </span>
                </th>
                <th className="px-6 py-2 text-sm md:text-base font-normal md:font-semibold">
                  {' '}
                  10,000{' '}
                  <span className="text-sm md:text-base font-normal">
                    {' '}
                    DEXTR
                  </span>{' '}
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
          <Link href={`${siteDomain}${webPort}/history`}>
            {' '}
            <button
              type="button"
              className="font-lexend font-semibold bg-transparent hover:bg-black text-black font-semibold hover:text-white py-2 px-4 border-2 border-black hover:border-transparent"
            >
              See Previous Results
            </button>{' '}
          </Link>
        </div>
      </div>
    </>
  );
};

export default Results;
