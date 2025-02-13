import processConnectorError from "components/[guild]/JoinModal/utils/processConnectorError"
import useGuild from "components/[guild]/hooks/useGuild"
import { useFetcherWithSign } from "hooks/useFetcherWithSign"
import useShowErrorToast from "hooks/useShowErrorToast"
import useSubmit from "hooks/useSubmit"
import useToast from "hooks/useToast"
import { PlatformGuildData, PlatformType } from "types"
import { DiscordEmbedForm } from "../components/SendDiscordJoinButtonModal"

const useSendJoin = (onSuccess?: () => void) => {
  const { mutateGuild } = useGuild()

  const toast = useToast()
  const showErrorToast = useShowErrorToast()
  const fetcerWithSign = useFetcherWithSign()

  const sendJoin = ({ serverId, ...body }: DiscordEmbedForm) =>
    fetcerWithSign([
      `/v2/discord/servers/${serverId}/button`,
      {
        method: "POST",
        body,
      },
    ])

  return useSubmit(sendJoin, {
    onError: (error) =>
      showErrorToast({
        error: processConnectorError(error.error) ?? error.error,
        correlationId: error.correlationId,
      }),
    onSuccess: () => {
      toast({
        status: "success",
        title: "Join button sent!",
      })
      mutateGuild(
        (prevGuild) => ({
          ...prevGuild,
          guildPlatforms: prevGuild.guildPlatforms.map((gp) => {
            if (
              gp.platformId === PlatformType.DISCORD &&
              !gp.platformGuildData?.joinButton
            )
              return {
                ...gp,
                platformGuildData: {
                  ...gp.platformGuildData,
                  joinButton: true,
                } as PlatformGuildData["DISCORD"],
              }
            return gp
          }),
        }),
        { revalidate: false }
      )
      onSuccess?.()
    },
  })
}

export default useSendJoin
