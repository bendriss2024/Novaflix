import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Linking, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cartMovies, Movie, removeFromCart } from './(tabs)/index';

export default function CartScreen() {
  const router = useRouter();
  const [refresher, setRefresher] = useState(0);

  const handleRemove = (movieId: string) => {
    removeFromCart(movieId);
    setRefresher(prev => prev + 1);
  };

  const handleWatch = (movie: Movie) => {
    if (Platform.OS === 'web') {
      window.open(`https://www.youtube.com/watch?v=${movie.trailerId}`, '_blank');
    } else {
      Linking.openURL(`https://www.youtube.com/watch?v=${movie.trailerId}`);
    }
  };

  const renderCartItem = ({ item }: { item: Movie }) => (
    <View style={styles.cartItem}>
      <ExpoImage source={{ uri: item.poster }} style={styles.cartPoster} contentFit="cover" />
      <View style={styles.cartInfo}>
        <ThemedText type="title" style={styles.cartTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.cartMeta}>{item.year} • {item.genre}</ThemedText>
        <View style={styles.cartActions}>
          <TouchableOpacity style={styles.watchButton} onPress={() => handleWatch(item)}>
            <Ionicons name="play" size={20} color="black" />
            <ThemedText style={styles.watchButtonText}>Watch Trailer</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.removeButton} onPress={() => handleRemove(item.id)}>
            <Ionicons name="trash" size={20} color="#ff4444" />
            <ThemedText style={styles.removeButtonText}>Remove</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>My List</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      {cartMovies.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="film" size={80} color="#333" />
          <ThemedText style={styles.emptyTitle}>Your list is empty</ThemedText>
          <ThemedText style={styles.emptyText}>Add movies to watch later</ThemedText>
          <TouchableOpacity style={styles.browseButton} onPress={() => router.replace('/')}>
            <ThemedText style={styles.browseButtonText}>Browse Movies</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={cartMovies}
          renderItem={renderCartItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          extraData={refresher}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    marginTop: 8,
  },
  browseButton: {
    backgroundColor: '#E50914',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 6,
    marginTop: 24,
  },
  browseButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContent: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  cartPoster: {
    width: 120,
    height: 180,
  },
  cartInfo: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  cartTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cartMeta: {
    color: '#888',
    fontSize: 14,
    marginBottom: 16,
  },
  cartActions: {
    flexDirection: 'row',
    gap: 12,
  },
  watchButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    gap: 6,
  },
  watchButtonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 14,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ff4444',
    gap: 6,
  },
  removeButtonText: {
    color: '#ff4444',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

