import { Fragment, useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { Combobox, Transition } from '@headlessui/react';
import {
  ChevronDownIcon as ChevronUpDownIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import Avatar from '../../components/Avatar';
import { siteDomain, webPort } from '../../config';
import Header from '../../components/Header';
import toast from 'react-hot-toast';
import Link from 'next/link';

type NominationFormProps = {
  isAuthenticated: boolean;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
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

  return { props: { isAuthenticated } };
};

const NominationForm: React.FC<NominationFormProps> = ({ isAuthenticated }) => {
  const [nominee, setNominee] = useState('');
  const [reason, setReason] = useState('');
  const [query, setQuery] = useState('');
  const [phase, setPhase] = useState(0);
  const [contributorsOptions, setContributorsOptions] = useState<
    { id: number; name: string }[]
  >([]);

  const router = useRouter();

  const filteredContributors = contributorsOptions.filter((option) =>
    option.name.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    const fetchContributors = async () => {
      try {
        const response = await fetch(`${siteDomain}${webPort}/api/conlist`);
        const data = await response.json();

        setContributorsOptions(
          data.conlist.map((contributor: { id: number; name: string }) => ({
            id: contributor.id,
            name: contributor.name,
          })),
        );
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchContributors();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch(`${siteDomain}${webPort}/api/nominations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nomination: nominee,
          reason: reason,
          phase: phase,
        }),
      });
      const data = await response.json();
      if (data.message) {
        toast.success(data.message);
        resetForm();
      } else if (data.error) {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const resetForm = () => {
    setNominee('');
    setReason('');
    setPhase(0);
  };

  return (
    <>
      <Header isLogged={isAuthenticated} />
      <div className="font-lexend font-normal justify-center items-center min-h-screen lg:p-20 box-border bg-gradient-to-br from-dexterblue via-dextergreen to-dextermegagreen">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm py-16">
          <h2 className="font-lexend font-semibold mt-32 text-center text-2xl font-bold leading-9 tracking-tight text-black my-10">
            Nominate someone
          </h2>

          <div className="px-2">
            <p className="text-black text-center mb-20">
              Nominate yourself or someone else. Make sure to write down the
              reason for their nomination and the contribution they made for
              the particular phase.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-5 text-black">
              <label htmlFor="nominee" className="block mb-2">
                Contributor TG Username
              </label>

              <div className="relative mt-1">
                <Combobox
                  value={nominee}
                  onChange={(value) => setNominee(value)}
                >
                  <div className="items-center inline-flex relative w-full cursor-default overflow-hidden bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
                    {/* Avatar */}
                    {nominee && (
                      <Avatar
                        name={nominee}
                        width={25}
                        height={25}
                        marginRight={5}
                        marginLeft={5}
                      />
                    )}
                    <Combobox.Input
                      className="shadow-md w-full border-none py-2 pl-3 pr-10 text-base leading-5 text-gray-900 focus:ring-0"
                      required
                      onChange={(event) => setQuery(event.target.value)}
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
                  >
                    <Combobox.Options
                      className="absolute mt-1 max-h-60 w-full overflow-auto   bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-base"
                      style={{ zIndex: 99999 }}
                    >
                      {filteredContributors.map((option) => (
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
                      ))}
                    </Combobox.Options>
                  </Transition>
                </Combobox>

                <div className="my-5">
                  <label htmlFor="phase" className="block mb-2">
                    Phase
                  </label>
                  <input
                    type="number"
                    id="phase"
                    className="shadow-md w-full border-none py-2 text-base leading-5 text-gray-900 focus:ring-0"
                    value={phase}
                    onChange={(e) => setPhase(Number(e.target.value))}
                    required
                    min={5}
                  />
                </div>
              </div>
            </div>
            <div className="mb-5 text-black">
              <label htmlFor="reason" className="block mb-2">
                Reason for nomination:
              </label>
              <textarea
                id="reason"
                className="shadow-md w-full border-none py-2 text-base leading-5 text-gray-900 focus:ring-0"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={8}
                required
              />
            </div>
            <div className="mt-2">
              <button
                type="submit"
                className="font-semibold bg-black hover:bg-dextergreen text-white font-semibold hover:text-black py-2 px-4 border-2 border-black"
              >
                Submit Nomination
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
            </div>
          </form>

          <div className="mt-20 text-center text-black hover:underline">
            <Link href={`${siteDomain}${webPort}/nominations`}>
              {' '}
              <span className="ml-1">
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
                    d="M9 9l6-6m0 0l6 6m-6-6v12a6 6 0 01-12 0v-3"
                  />
                </svg>
                See all nominations
              </span>{' '}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
export default NominationForm;
