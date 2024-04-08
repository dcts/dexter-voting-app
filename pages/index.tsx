import { Fragment, useState, useEffect } from 'react';
import Header from '../components/Header';
import { GetServerSideProps } from 'next';
import { Combobox, Transition } from '@headlessui/react';
import Avatar from '../components/Avatar';
import {
  ChevronDownIcon as ChevronUpDownIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { wsPort, webPort, siteDomain } from '../config';

type Contributor = {
  id: number;
  name: string;
  skills: string;
};

type VotedContributor = {
  contributor: string;
  points: number;
};

type VotingFormProps = {
  activePhase: number | null;
  isAuthenticated: boolean; // add this line
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;
  const { cookies } = req;

  // Check if the user is authenticated
  const isAuthenticated = cookies.userToken === 'user-token-value'; // Replace with your actual token value

  if (!isAuthenticated) {
    return {
      redirect: {
        destination: '/login', // Redirect to login page if not authenticated
        permanent: false,
      },
    };
  }

  // Fetch the active phase

  const resPhase = await fetch(`${siteDomain}${webPort}/api/phase-control`);

  const dataPhase = await resPhase.json();
  const activePhase = dataPhase.activePhase || null;

  return {
    props: { activePhase, isAuthenticated },
  };
};

export default function VotingForm({
  activePhase,
  isAuthenticated,
}: VotingFormProps) {
  const [loading, setLoading] = useState(false); // New loading state
  const [totalPoints, setTotalPoints] = useState(0); // State to track total points

  const [selectedContributors, setSelectedContributors] = useState<string[]>(
    [],
  ); // check dropdown

  const removeContributor = (index: number) => {
    setSelectedContributors((prev) =>
      prev.filter((name) => name !== contributors[index].contributor),
    );

    setContributors((prevContributors) => {
      return prevContributors.filter(
        (_, contributorIndex) => contributorIndex !== index,
      );
    });
  };

  const [contributors, setContributors] = useState<VotedContributor[]>([
    { contributor: '', points: 0 },
    { contributor: '', points: 0 },
    { contributor: '', points: 0 },
  ]);

  const [query, setQuery] = useState('');

  const [contributorsOptions, setContributorsOptions] = useState<
    { id: number; name: string }[]
  >([]);

  let headingText;
  if (activePhase == 0 || !activePhase) {
    headingText =
      'Nomination phase in not active! Your voting will not be recorded';
  } else {
    headingText = `Community Contribution Survey: Phase ${activePhase}`;
  }

  let headingText2;
  if (activePhase == 0 || !activePhase) {
    headingText =
      'Nomination phase in not active! Your voting will not be recorded';
  } else {
    headingText2 = `See temporary results`;
  }

  // Loading Spinner Component
  const Spinner = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="animate-spin h-5 w-5 mr-3"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    </svg>
  );

  useEffect(() => {
    const fetchContributors = async () => {
      try {
        const response = await fetch(`${siteDomain}${webPort}/api/conlist`);
        const data = await response.json();

        setContributorsOptions(
          data.conlist.map((contributor: Contributor) => ({
            id: contributor.id,
            name: contributor.name,
          })),
        ); // Set the contributorsOptions
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchContributors(); // Call fetchContributors function
  }, []);

  const filteredContributors =
    query === ''
      ? contributorsOptions.filter(
          (option) => !selectedContributors.includes(option.name),
        )
      : contributorsOptions.filter(
          (contributor) =>
            contributor.name
              .toLowerCase()
              .replace(/\s+/g, '')
              .includes(query.toLowerCase().replace(/\s+/g, '')) &&
            !selectedContributors.includes(contributor.name),
        );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); // Start loading when form is submitted

    let totalPoints = 0;
    const inputElement = document.querySelector<HTMLInputElement>('#username');
    let username;

    if (inputElement) {
      username = inputElement.value;
    } else {
      return;
    }

    let votes = [];

    for (let i = 0; i < contributors.length; i++) {
      let { contributor, points } = contributors[i];
      if (contributor === username) {
        toast.error(
          'You cannot vote for yourself! Remove your nomination and try again.',
        );

        setLoading(false); // End loading

        return;
      }

      const votedContributors = contributors.slice(0, i);
      if (votedContributors.some((c) => c.contributor === contributor)) {
        toast.error(
          'You voted for one same contributor more than once! Check your form and try again.',
        );

        setLoading(false); // End loading

        return;
      }

      totalPoints += points; // <-- the change is here
      if (totalPoints > 100) {
        toast.error(
          'You cannot allocate more than 100 points! Check your points and try again.',
        );

        setLoading(false); // End loading

        return;
      }
      votes.push({ contributorName: contributor, points: points });
    }

    if (votes.length) {
      try {
        const response = await fetch(`${siteDomain}${webPort}/api/votes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: username, votes: votes }),
        });
        const data = await response.json();
        if (data.message) {
          toast.success(data.message);

          setLoading(false); // End loading

          resetForm();
        } else if (data.error) {
          toast.error(data.error);

          setLoading(false); // End loading
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const addContributor = () => {
    setContributors([...contributors, { contributor: '', points: 0 }]);
  };

  const updateContributor = (
    index: number,
    field: keyof VotedContributor,
    value: string | number,
  ) => {
    if (field === 'contributor') {
      setSelectedContributors((prev) => [...prev, value.toString()]);
    }

    setContributors((prevContributors) => {
      const newContributors = [...prevContributors];

      // Calculate total points of contributors excluding the current contributor
      const otherTotal = newContributors.reduce(
        (total, curr, currIndex) =>
          currIndex === index ? total : total + (Number(curr.points) || 0),
        0,
      );

      if (field === 'points') {
        const numericValue = Number(value);
        const remainingPoints = 100 - otherTotal;

        // Calculate maximum value allowed for this input
        const maxAllowedValue = remainingPoints < 40 ? remainingPoints : 40;

        // Check if the entered value is greater than the max allowed value
        newContributors[index] = {
          ...newContributors[index],
          [field]:
            numericValue > maxAllowedValue ? maxAllowedValue : numericValue,
        };
      } else if (field === 'contributor') {
        newContributors[index] = {
          ...newContributors[index],
          [field]: value.toString(),
        };
      }

      // Set total points
      const totalPoints = newContributors.reduce(
        (total, curr) => total + (Number(curr.points) || 0),
        0,
      );
      setTotalPoints(totalPoints);

      return newContributors;
    });
  };

  const resetForm = () => {
    setContributors([{ contributor: '', points: 0 }]);
    setQuery('');
    // Reset the username field
    const usernameInput = document.getElementById(
      'username',
    ) as HTMLInputElement;
    if (usernameInput) {
      usernameInput.value = '';
    }
  };

  return (
    <>
      <Header isLogged={isAuthenticated} />
      <div className="font-lexend font-normal justify-center items-center min-h-screen lg:p-20 box-border bg-gradient-to-br from-dexterblue via-dextergreen to-dextermegagreen">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm py-16">
          <h2 className="font-lexend font-semibold mt-32 text-center text-2xl font-bold leading-9 tracking-tight text-black">
            {headingText}
          </h2>

          <Link href={`${siteDomain}${webPort}/results`}>
            {' '}
            <div className="mt-10 text-black text-center cursor-pointer hover:underline">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 inline mb-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                />
              </svg>

              {headingText2}
            </div>
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="text-black w-full max-w-md mx-auto p-5 box-border "
        >
          <div className="mb-5 pb-10 ">
            <label htmlFor="username" className="block mb-2">
              Your Telegram Username
            </label>
            <input
              type="text"
              id="username"
              className="shadow-md w-full border-none py-2 pl-3 pr-10 text-base leading-5 text-gray-900 focus:ring-0"
              required
            />
          </div>
          {contributors.map((contributor, index) => (
            <div className="flex" key={index}>
              <div className="mb-5 w-full">
                <label htmlFor="contributor" className="block mb-2">
                  {' '}
                  {index > 0 ? `Contributor ${index + 1}` : 'Contributor 1'}
                </label>
                <div className="relative mt-1">
                  <Combobox
                    value={contributor.contributor}
                    onChange={(value) =>
                      updateContributor(index, 'contributor', value)
                    }
                  >
                    <div className="items-center inline-flex relative w-full cursor-default overflow-hidden bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
                      {/* Avatar */}
                      {contributor.contributor && (
                        <Avatar
                          name={contributor.contributor}
                          width={25}
                          height={25}
                          marginRight={5}
                          marginLeft={5}
                        />
                      )}
                      <Combobox.Input
                        className="shadow-md w-full border-none py-2 pl-3 pr-10 text-base leading-5 text-gray-900 focus:ring-0  "
                        onChange={(event) => setQuery(event.target.value)}
                        required
                      />
                      <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </Combobox.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                      afterLeave={() => setQuery('')}
                    >
                      <Combobox.Options
                        className="absolute mt-1 max-h-60 w-full overflow-auto   bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-base"
                        style={{ zIndex: 99999 }}
                      >
                        {filteredContributors.length === 0 && query !== '' ? (
                          <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                            Nothing found.
                          </div>
                        ) : (
                          filteredContributors.map((option) => (
                            <Combobox.Option
                              key={option.id}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-4 pr-4 ${
                                  active
                                    ? 'bg-dextergreen text-black'
                                    : 'text-gray-900'
                                }`
                              }
                              value={option.name}
                            >
                              {({ selected, active }) => (
                                <>
                                  <span
                                    className={`block truncate ${
                                      selected ? 'font-medium' : 'font-normal'
                                    } cursor-pointer`}
                                  >
                                    <div className="inline-flex items-center">
                                      <Avatar
                                        name={option.id.toString()}
                                        width={30}
                                        height={30}
                                        marginRight={10}
                                      />
                                      {option.name}
                                    </div>
                                  </span>

                                  {selected ? (
                                    <span
                                      className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                        active ? 'text-white' : 'text-teal-600'
                                      }`}
                                    >
                                      <CheckIcon
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                      />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Combobox.Option>
                          ))
                        )}
                      </Combobox.Options>
                    </Transition>
                  </Combobox>
                </div>
              </div>
              <div className="mb-5">
                <label htmlFor="points" className="block mb-2 ml-2">
                  Points
                </label>
                <input
                  type="number"
                  id="points"
                  className="shadow-md border-none py-2 text-base leading-5 text-gray-900 focus:ring-0 ml-2"
                  value={contributor.points}
                  onChange={(e) =>
                    updateContributor(index, 'points', e.target.value)
                  }
                  required
                  min={1}
                  max={40}
                />
              </div>

              <button
                type="button"
                onClick={() => removeContributor(index)}
                className={`text-black text-sm font-semibold ml-3 mt-4 ${
                  index === 0 ? 'invisible' : ''
                }`}
              >
                {index === 0 ? 'Y' : 'X'}
              </button>
            </div>
          ))}
          <div>
            <button
              type="button"
              onClick={addContributor}
              className="mb-2 font-lexend w-full font-semibold bg-transparent hover:bg-black text-black font-semibold hover:text-white py-2 px-4 border-2 border-black hover:border-transparent"
            >
              +add contributor
            </button>
            <div>
              <button
                type="submit"
                className="font-lexend w-full font-semibold bg-black hover:bg-dextergreen text-white font-semibold hover:text-black py-2 px-4 border-2 border-black"
              >
                {loading ? <Spinner /> : 'SUBMIT VOTE!'}

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
              </button>

              <div className="flex justify-center items-center m-4">
                {/* <div   className="p-2 mt-8 absolute right-1/4 top-1/2" > */}
                <span
                  className={`text-center ${
                    totalPoints > 100 ? 'text-red-500' : ''
                  }`}
                >
                  Total Points: {totalPoints} /100
                </span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
