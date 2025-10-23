"use client"

import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react"
import { session, useAuth } from "./AuthProvider"
import { useData } from "./DataProvider"
import {
  aiAgent,
  thread,
  app,
  collaboration,
  user,
  characterProfile,
  guest,
  message,
} from "../../types"
import { getThreadId } from "../../utils/url"
import { useThreadId } from "../../utils/useThreadId"
import {
  toast,
  useCookie,
  useLocalStorage,
  useNavigation,
} from "../../platform"
import { useApp } from "./AppProvider"
import { getHourlyLimit } from "../../utils/getHourlyLimit"
import { t } from "i18next"

interface placeHolder {
  // TODO: Define placeHolder type
  [key: string]: any
}

const ChatContext = createContext<
  | {
      messages: {
        message: message & {
          isStreaming?: boolean
          isStreamingStop?: boolean
        }
        user?: user
        guest?: guest
        aiAgent?: aiAgent
        thread?: thread
      }[]
      setMessages: React.Dispatch<
        React.SetStateAction<
          {
            message: message & {
              isStreaming?: boolean
              isStreamingStop?: boolean
            }
            user?: user
            guest?: guest
            aiAgent?: aiAgent
            thread?: thread
          }[]
        >
      >
      perplexityAgent?: aiAgent
      deepSeekAgent?: aiAgent
      claudeAgent?: aiAgent
      favouriteAgent?: aiAgent
      setCreditsLeft: (creditsLeft: number) => void
      isWebSearchEnabled: boolean
      selectedAgent: aiAgent | undefined | null
      setSelectedAgent: (agent: aiAgent | undefined | null) => void
      aiAgents: aiAgent[]
      hitHourlyLimit: boolean
      debateAgent: aiAgent | undefined | null
      setDebateAgent: (agent: aiAgent | undefined | null) => void
      isDebating: boolean
      setIsDebating: (isDebating: boolean) => void
      hourlyLimit: number
      hourlyUsageLeft: number
      isEmpty: boolean
      setIsEmpty: (isEmpty: boolean) => void
      shouldRefetchThread: boolean
      setShouldRefetchThread: (shouldRefetchThread: boolean) => void
      isChatFloating: boolean
      setIsChatFloating: (isChatFloating: boolean) => void
      input: string
      setIsWebSearchEnabled: (isWebSearchEnabled: boolean) => void
      setInput: (input: string) => void
      placeHolder: placeHolder | undefined
      setPlaceHolder: (placeHolder: placeHolder | undefined) => void
      creditsLeft?: number
      thread?: thread & {
        characterProfile?: characterProfile
        app?: app
        placeHolder?: placeHolder
        collaborations?: { collaboration: collaboration; user: user }[]
      }
      threadId?: string
      setThreadId: (threadId?: string) => void
      setThread: (
        thread:
          | (thread & {
              app?: app
              placeHolder?: placeHolder
              collaborations?: { collaboration: collaboration; user: user }[]
            })
          | undefined,
      ) => void
    }
  | undefined
>(undefined)

export function ChatProvider({
  children,
  ...props
}: {
  children: ReactNode
  session?: session
}) {
  // Get auth data
  const { setGuest, setUser, ...auth } = useAuth()
  const [session, setSession] = useState(props.session)

  useEffect(() => {
    auth.session && setSession(auth.session)
  }, [auth.session])

  const user = auth.user || session?.user
  const guest = auth.guest || session?.guest
  const [isChatFloating, setIsChatFloating] = useState(false)

  // Chat state
  const [input, setInput] = useState<string>("")
  const [isEmpty, setIsEmpty] = useState(true)
  const [thread, setThread] = useState<
    | (thread & {
        app?: app
        placeHolder?: placeHolder
        collaborations?: { collaboration: collaboration; user: user }[]
      })
    | undefined
  >(undefined)

  const [messages, setMessages] = useState<
    {
      message: message & {
        isStreaming?: boolean
        isStreamingStop?: boolean
      }
      user?: user
      guest?: guest
      aiAgent?: aiAgent
      thread?: thread
    }[]
  >([])

  const { pathname } = useNavigation()

  const [threadId, setThreadId] = useState(getThreadId(pathname))

  useEffect(() => {
    setThreadId(getThreadId(pathname))
  }, [pathname])

  // Credits tracking
  const [creditsLeft, setCreditsLeft] = useState<number | undefined>(undefined)

  const { track, aiAgents } = useAuth()

  useEffect(() => {
    if (user?.creditsLeft || guest?.creditsLeft) {
      setCreditsLeft(user?.creditsLeft || guest?.creditsLeft)
    }
  }, [user?.creditsLeft, guest?.creditsLeft])

  // AI Agents

  const claudeAgent = aiAgents?.find((agent) => agent.name === "claude")

  const returnSelectedAgent = (
    agent: aiAgent | undefined | null,
  ): aiAgent | undefined | null => {
    if (!isAgentAuthorized(agent)) {
      const a = isWebSearchEnabled
        ? perplexityAgent
        : user
          ? favouriteAgent?.name === "perplexity"
            ? claudeAgent
            : favouriteAgent
          : deepSeekAgent

      return a
    }

    return agent
  }

  const [debateAgent, setDebateAgentInternal] = useLocalStorage<
    aiAgent | undefined | null
  >("debateAgent", undefined)

  useEffect(() => {
    if (debateAgent) {
      track({
        name: "debate_agent_selected",
        props: { agent: debateAgent.displayName },
      })
    }
  }, [debateAgent])

  const isAgentAuthorized = (agent: aiAgent | undefined | null) => {
    if (!agent) return false
    if (user?.subscription || guest?.subscription) {
      return true
    }
    return user
      ? !["subscriber"].includes(agent.authorization)
      : ["guest", "all"].includes(agent.authorization)
  }

  const deepSeekAgent = aiAgents?.find((agent) => agent.name === "deepSeek")
  const perplexityAgent = aiAgents?.find((agent) => agent.name === "perplexity")
  const favouriteAgent = aiAgents?.find(
    (agent) => agent.name === (user || guest)?.favouriteAgent,
  )

  const [placeHolder, setPlaceHolder] = React.useState<placeHolder | undefined>(
    undefined,
  )

  const { appStatus } = useApp()

  useEffect(() => {
    if (appStatus?.part) {
      if (user) {
        setSelectedAgent(claudeAgent)
      } else if (guest) {
        setSelectedAgent(deepSeekAgent)
      }
    }
  }, [appStatus?.part, guest, user])

  useEffect(() => {
    if (threadId) {
      thread?.placeHolder
        ? setPlaceHolder(thread?.placeHolder)
        : setPlaceHolder(undefined)
      return
    }
    const newPlaceHolder = user?.placeHolder || guest?.placeHolder
    if (newPlaceHolder) {
      setPlaceHolder(newPlaceHolder)
    }
  }, [thread?.placeHolder, user?.placeHolder, guest?.placeHolder, threadId])

  const [shouldRefetchThread, setShouldRefetchThread] = useState(false)

  useEffect(() => {
    if (!threadId) {
      thread && setThread(undefined)
    }
  }, [threadId, thread])

  const [agentName, setAgentName] = useCookie(
    "agentName",
    session?.aiAgent?.name,
  )

  const [isWebSearchEnabled, setIsWebSearchEnabledInternal] =
    useLocalStorage<boolean>("isWebSearchEnabled", agentName === "perplexity")

  const setSelectedAgent = (agent: aiAgent | undefined | null) => {
    if (agent === null) {
      setAgentName("")
      setSelectedAgentInternal(null)
      setDebateAgent(null)
      return
    }

    if (agent?.name === "flux" && debateAgent) {
      setDebateAgent(null)
    }

    const a = returnSelectedAgent(agent)
    setSelectedAgentInternal(a)
    setAgentName(a?.name || "")
    setIsWebSearchEnabledInternal(a?.capabilities?.webSearch || false)
  }

  const [selectedAgent, setSelectedAgentInternal] = useLocalStorage<
    aiAgent | undefined | null
  >("selectedAgent", returnSelectedAgent(session?.aiAgent))
  const setIsWebSearchEnabled = (value: boolean) => {
    value
      ? setSelectedAgent(perplexityAgent)
      : setSelectedAgent(
          user
            ? favouriteAgent?.name == "perplexity"
              ? claudeAgent
              : favouriteAgent
            : deepSeekAgent,
        )
    setIsWebSearchEnabledInternal(value)
  }

  const setDebateAgent = (agent: aiAgent | undefined | null) => {
    if (selectedAgent?.name === "flux") setSelectedAgent(undefined)
    setDebateAgentInternal(agent)
  }

  useEffect(() => {
    if (!user && !guest) return
    if (aiAgents?.length) {
      if (selectedAgent === null) return

      if (selectedAgent) {
        const currentAgent = aiAgents.find(
          (agent) => agent.name === selectedAgent.name,
        )
        setSelectedAgent(currentAgent)

        return
      }

      setSelectedAgent(undefined)
    }
  }, [aiAgents, selectedAgent, user, guest])

  const { isDevelopment, isE2E } = useData()

  const hourlyLimit =
    isDevelopment && !isE2E
      ? 50000
      : getHourlyLimit({
          member: user,
          guest,
        })

  const hourlyUsageLeft = user
    ? hourlyLimit - (user?.messagesLastHour || 0)
    : hourlyLimit - (guest?.messagesLastHour || 0)

  const [isDebating, setIsDebating] = useState(false)

  const hitHourlyLimit = hourlyUsageLeft <= 0

  // Auto-refresh hourly limits when timer expires
  useEffect(() => {
    if (!hitHourlyLimit) return

    const lastMessage = user?.lastMessage || guest?.lastMessage
    if (!lastMessage?.createdOn) return

    const lastMessageTime = new Date(lastMessage.createdOn)
    const oneHourLater = new Date(lastMessageTime.getTime() + 60 * 60 * 1000)
    const now = new Date()

    if (now >= oneHourLater) {
      // Hour has already passed, reset immediately
      if (user) {
        setUser({ ...user, messagesLastHour: 0 })
      }
      if (guest) {
        setGuest({ ...guest, messagesLastHour: 0 })
      }
      return
    }

    // Set timer for when hour expires
    const timeUntilReset = oneHourLater.getTime() - now.getTime()
    const timer = setTimeout(() => {
      if (user) {
        setUser({ ...user, messagesLastHour: 0 })
      }
      if (guest) {
        setGuest({ ...guest, messagesLastHour: 0 })
      }
    }, timeUntilReset)

    return () => clearTimeout(timer)
  }, [
    hitHourlyLimit,
    user?.lastMessage?.createdOn,
    guest?.lastMessage?.createdOn,
    user,
    guest,
  ])

  useEffect(() => {
    debateAgent && !user && guest && setDebateAgent(null)
  }, [user, guest, debateAgent])

  useEffect(() => {
    if (hitHourlyLimit) {
      toast.error(
        t("You hit your hourly limit {{hourlyLimit}}", {
          hourlyLimit,
        }),
      )
    }
  }, [hitHourlyLimit])

  return (
    <ChatContext.Provider
      value={{
        setIsWebSearchEnabled,
        input,
        creditsLeft,
        aiAgents,
        setInput,
        placeHolder,
        setPlaceHolder,
        isChatFloating,
        setIsChatFloating,
        shouldRefetchThread,
        setShouldRefetchThread,
        thread,
        setThread,
        threadId,
        isEmpty,
        setIsEmpty,
        setThreadId,
        isWebSearchEnabled,
        selectedAgent,
        setSelectedAgent,
        hitHourlyLimit,
        debateAgent,
        setDebateAgent,
        isDebating,
        setIsDebating,
        hourlyLimit,
        hourlyUsageLeft,
        setCreditsLeft,
        perplexityAgent,
        deepSeekAgent,
        claudeAgent,
        favouriteAgent,
        messages,
        setMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error("useChat must be used within ChatProvider")
  }
  return context
}
