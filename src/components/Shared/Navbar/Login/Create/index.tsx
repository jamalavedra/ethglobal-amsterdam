import { gql, useMutation } from '@apollo/client'
import SwitchNetwork from '@components/Shared/SwitchNetwork'
import { Button } from '@components/UI/Button'
import { ErrorMessage } from '@components/UI/ErrorMessage'
import { Form, useZodForm } from '@components/UI/Form'
import { Input } from '@components/UI/Input'
import { Spinner } from '@components/UI/Spinner'
import { PlusIcon } from '@heroicons/react/outline'
import React, { ChangeEvent, FC, useState } from 'react'
import { CHAIN_ID } from 'src/constants'
import { useNetwork } from 'wagmi'
import { object, string } from 'zod'

import Pending from './Pending'

const CREATE_PROFILE_MUTATION = gql`
  mutation CreateProfile($request: CreateProfileRequest!) {
    createProfile(request: $request) {
      ... on RelayerResult {
        txHash
      }
      ... on RelayError {
        reason
      }
    }
  }
`

const newUserSchema = object({
  handle: string()
    .min(2, { message: 'Handle should be atleast 2 characters' })
    .max(31, { message: 'Handle should be less than 32 characters' })
    .regex(/^[a-z0-9]+$/, {
      message: 'Handle should only contain alphanumeric characters'
    })
})

interface Props {
  isModal?: boolean
}

const Create: FC<Props> = ({ isModal = false }) => {
  const [avatar, setAvatar] = useState<string>()
  const [uploading, setUploading] = useState<boolean>(false)
  const { activeChain } = useNetwork()
  const [createProfile, { data, loading }] = useMutation(
    CREATE_PROFILE_MUTATION
  )

  const form = useZodForm({
    schema: newUserSchema
  })

  const handleUpload = async (evt: ChangeEvent<HTMLInputElement>) => {
    evt.preventDefault()
    setUploading(true)
    try {
    } finally {
      setUploading(false)
    }
  }

  return data?.createProfile?.txHash ? (
    <Pending
      handle={form.getValues('handle')}
      txHash={data?.createProfile?.txHash}
    />
  ) : (
    <Form
      form={form}
      className="space-y-4"
      onSubmit={({ handle }) => {
        const username = handle.toLowerCase()
        createProfile({
          variables: {
            request: {
              handle: username,
              profilePictureUri: avatar
                ? avatar
                : `https://avatar.tobi.sh/${username}.png`
            }
          }
        })
      }}
    >
      {data?.createProfile?.reason && (
        <ErrorMessage
          className="mb-3"
          title="Create profile failed!"
          error={{
            name: 'Create profile failed!',
            message: data?.createProfile?.reason
          }}
        />
      )}
      {isModal && (
        <div className="mb-2 space-y-4">
          <img className="w-10 h-10" src="/logo.svg" alt="Logo" />
          <div className="text-xl font-bold">Signup to Marbel</div>
        </div>
      )}
      <Input
        label="Handle"
        type="text"
        placeholder="Stanni"
        {...form.register('handle')}
      />

      <div className="ml-auto">
        {activeChain?.id !== CHAIN_ID ? (
          <SwitchNetwork />
        ) : (
          <Button
            type="submit"
            disabled={loading}
            icon={
              loading ? <Spinner size="xs" /> : <PlusIcon className="w-4 h-4" />
            }
          >
            Signup
          </Button>
        )}
      </div>
    </Form>
  )
}

export default Create
