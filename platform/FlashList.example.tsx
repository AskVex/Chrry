/**
 * FlashList Usage Examples
 *
 * Demonstrates various use cases for the universal FlashList component
 */

import React, { useState } from "react"
import { FlashList } from "./FlashList"
import { Div, Text } from "./PlatformPrimitives"
import { usePlatformStyles } from "./usePlatformStyles"

// ============================================
// EXAMPLE 1: Basic List
// ============================================

interface BasicItem {
  id: string
  title: string
  description: string
}

export function BasicListExample() {
  const data: BasicItem[] = Array.from({ length: 100 }, (_, i) => ({
    id: `item-${i}`,
    title: `Item ${i + 1}`,
    description: `Description for item ${i + 1}`,
  }))

  const itemStyles = usePlatformStyles({
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  })

  return (
    <FlashList
      data={data}
      renderItem={({ item }) => (
        <Div style={itemStyles.style}>
          <Text style={{ fontSize: 16, fontWeight: "600" }}>{item.title}</Text>
          <Text style={{ fontSize: 14, color: "#666", marginTop: 4 }}>
            {item.description}
          </Text>
        </Div>
      )}
      estimatedItemSize={80}
      keyExtractor={(item) => item.id}
    />
  )
}

// ============================================
// EXAMPLE 2: Horizontal Carousel
// ============================================

interface CarouselItem {
  id: string
  image: string
  title: string
}

export function HorizontalCarouselExample() {
  const data: CarouselItem[] = Array.from({ length: 20 }, (_, i) => ({
    id: `card-${i}`,
    image: `/images/card-${i}.jpg`,
    title: `Card ${i + 1}`,
  }))

  const cardStyles = usePlatformStyles({
    width: 200,
    height: 300,
    marginRight: 16,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    overflow: "hidden",
  })

  return (
    <FlashList
      data={data}
      renderItem={({ item }) => (
        <Div style={cardStyles.style}>
          <img
            src={item.image}
            alt={item.title}
            style={{ width: "100%", height: 200, objectFit: "cover" }}
          />
          <Div style={{ padding: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: "600" }}>
              {item.title}
            </Text>
          </Div>
        </Div>
      )}
      horizontal
      estimatedItemSize={216}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ padding: 16 }}
    />
  )
}

// ============================================
// EXAMPLE 3: Grid Layout
// ============================================

interface GridItem {
  id: string
  color: string
  label: string
}

export function GridLayoutExample() {
  const data: GridItem[] = Array.from({ length: 50 }, (_, i) => ({
    id: `grid-${i}`,
    color: `hsl(${(i * 360) / 50}, 70%, 60%)`,
    label: `${i + 1}`,
  }))

  const gridItemStyles = usePlatformStyles({
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  })

  return (
    <FlashList
      data={data}
      renderItem={({ item }) => (
        <Div
          style={{
            ...gridItemStyles.style,
            backgroundColor: item.color,
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: "bold", color: "white" }}>
            {item.label}
          </Text>
        </Div>
      )}
      numColumns={3}
      estimatedItemSize={120}
      contentContainerStyle={{ padding: 8 }}
    />
  )
}

// ============================================
// EXAMPLE 4: Infinite Scroll
// ============================================

interface Post {
  id: string
  title: string
  author: string
  date: string
}

export function InfiniteScrollExample() {
  const [posts, setPosts] = useState<Post[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const loadMore = async () => {
    if (loading || !hasMore) return

    setLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newPosts: Post[] = Array.from({ length: 20 }, (_, i) => ({
      id: `post-${page}-${i}`,
      title: `Post ${(page - 1) * 20 + i + 1}`,
      author: `Author ${Math.floor(Math.random() * 10) + 1}`,
      date: new Date().toLocaleDateString(),
    }))

    setPosts([...posts, ...newPosts])
    setPage(page + 1)
    setLoading(false)

    // Stop after 5 pages
    if (page >= 5) {
      setHasMore(false)
    }
  }

  React.useEffect(() => {
    loadMore()
  }, [])

  const postStyles = usePlatformStyles({
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  })

  return (
    <FlashList
      data={posts}
      renderItem={({ item }) => (
        <Div style={postStyles.style}>
          <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>
            {item.title}
          </Text>
          <Text style={{ fontSize: 14, color: "#666" }}>
            By {item.author} • {item.date}
          </Text>
        </Div>
      )}
      estimatedItemSize={90}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={() =>
        loading ? (
          <Div style={{ padding: 16, alignItems: "center" }}>
            <Text style={{ color: "#666" }}>Loading more posts...</Text>
          </Div>
        ) : !hasMore ? (
          <Div style={{ padding: 16, alignItems: "center" }}>
            <Text style={{ color: "#666" }}>No more posts</Text>
          </Div>
        ) : null
      }
    />
  )
}

// ============================================
// EXAMPLE 5: Pull to Refresh
// ============================================

export function PullToRefreshExample() {
  const [items, setItems] = useState<BasicItem[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const fetchItems = async () => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    return Array.from({ length: 30 }, (_, i) => ({
      id: `item-${Date.now()}-${i}`,
      title: `Item ${i + 1}`,
      description: `Updated at ${new Date().toLocaleTimeString()}`,
    }))
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    const newItems = await fetchItems()
    setItems(newItems)
    setRefreshing(false)
  }

  React.useEffect(() => {
    fetchItems().then(setItems)
  }, [])

  const itemStyles = usePlatformStyles({
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  })

  return (
    <FlashList
      data={items}
      renderItem={({ item }) => (
        <Div style={itemStyles.style}>
          <Text style={{ fontSize: 16, fontWeight: "600" }}>{item.title}</Text>
          <Text style={{ fontSize: 14, color: "#666", marginTop: 4 }}>
            {item.description}
          </Text>
        </Div>
      )}
      estimatedItemSize={80}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      ListEmptyComponent={() => (
        <Div
          style={{
            padding: 32,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 16, color: "#999" }}>
            Pull down to load items
          </Text>
        </Div>
      )}
    />
  )
}

// ============================================
// EXAMPLE 6: With Header & Footer
// ============================================

export function HeaderFooterExample() {
  const data: BasicItem[] = Array.from({ length: 50 }, (_, i) => ({
    id: `item-${i}`,
    title: `Item ${i + 1}`,
    description: `Description ${i + 1}`,
  }))

  const headerStyles = usePlatformStyles({
    padding: 24,
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  })

  const footerStyles = usePlatformStyles({
    padding: 24,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  })

  return (
    <FlashList
      data={data}
      renderItem={({ item }) => (
        <Div style={{ padding: 16 }}>
          <Text style={{ fontSize: 16 }}>{item.title}</Text>
        </Div>
      )}
      estimatedItemSize={60}
      ListHeaderComponent={() => (
        <Div style={headerStyles.style}>
          <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 8 }}>
            My List
          </Text>
          <Text style={{ fontSize: 14, color: "#666" }}>
            {data.length} items total
          </Text>
        </Div>
      )}
      ListFooterComponent={() => (
        <Div style={footerStyles.style}>
          <Text style={{ fontSize: 14, color: "#666" }}>End of list</Text>
        </Div>
      )}
      ItemSeparatorComponent={() => (
        <Div style={{ height: 1, backgroundColor: "#e0e0e0" }} />
      )}
    />
  )
}
