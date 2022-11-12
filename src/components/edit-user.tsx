import { Dialog, Transition } from "@headlessui/react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Fragment, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

import { trpc } from "src/utils/trpc";

interface EditUserInputs {
  id: string;
  name: string;
  phoneNumber?: string;
}

interface EditUserProps {
  userId: string;
  name: string;
}
const EditUser = ({ userId, name }: EditUserProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const utils = trpc.useContext();

  const updateUser = trpc.user.updateUser.useMutation({
    async onSuccess() {
      await utils.user.getUserByEmail.invalidate();
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditUserInputs>();

  const onSubmit: SubmitHandler<EditUserInputs> = async (data) => {
    try {
      data.id = userId;
      const newUser = await updateUser.mutateAsync(data);
      if (newUser) {
        setIsOpen(false);
        toast("User updated!", {
          duration: 2000,
          position: "top-center",
          icon: "👏",
          iconTheme: {
            primary: "#000",
            secondary: "#fff",
          },
        });
      }
    } catch {}
  };

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  return (
    <>
      <Toaster />
      <div className="flex items-center justify-center">
        <button type="button" onClick={openModal} className="button w-40">
          Edit User
        </button>
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-center text-lg font-medium leading-6 text-gray-900"
                  >
                    Edit User
                  </Dialog.Title>
                  <div className="mt-2">
                    <form
                      className="rounded bg-slate-500 p-4 dark:bg-slate-200"
                      onSubmit={handleSubmit(onSubmit)}
                    >
                      <div className="mb-4">
                        <label
                          className="mb-2 block text-sm font-bold"
                          htmlFor="name"
                        >
                          Name
                        </label>
                        <input
                          className="focus:shadow-outline w-full appearance-none rounded border py-2 px-3 leading-tight shadow focus:outline-none"
                          id="name"
                          type="text"
                          defaultValue={name}
                          placeholder="Name"
                          {...register("name", { required: true })}
                        />
                        {errors.name && <span>This field is required</span>}
                      </div>

                      <div className="flex justify-center">
                        <button className="button w-64" type="submit">
                          Update Info
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="mt-4 flex justify-center">
                    <button
                      type="button"
                      className="button w-40"
                      onClick={closeModal}
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default EditUser;
