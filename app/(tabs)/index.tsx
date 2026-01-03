import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock Data Structure for Movies
export interface Movie {
  id: string;
  title: string;
  poster: string;
  cover: string;
  description: string;
  trailerId: string;
  genre: string;
  year: string;
  rating: string;
}

// Global cart state (simplified for demo - use Context/Redux in production)
export const cartMovies: Movie[] = [];
export const addToCart = (movie: Movie) => {
  if (!cartMovies.find(m => m.id === movie.id)) {
    cartMovies.push(movie);
  }
};
export const removeFromCart = (movieId: string) => {
  const index = cartMovies.findIndex(m => m.id === movieId);
  if (index > -1) {
    cartMovies.splice(index, 1);
  }
};

const CATEGORIES = [
  {
    id: 'trending',
    title: 'Trending Now',
    data: [
      { id: '1', title: 'Stranger Things', poster: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg', cover: 'https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYkJu64HIIV.jpg', description: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments.', trailerId: 'b9EkMc79ZSU', genre: 'Sci-Fi', year: '2022', rating: '98%' },
      { id: '2', title: 'Wednesday', poster: 'https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg', cover: 'https://image.tmdb.org/t/p/original/iHSwvRVsRyxpX7FE7GbviaDvgGZ.jpg', description: 'Smart, sarcastic and a little dead inside, Wednesday Addams investigates a murder spree.', trailerId: 'Q73UhUTs6y0', genre: 'Comedy', year: '2022', rating: '95%' },
      { id: '3', title: 'The Witcher', poster: 'https://image.tmdb.org/t/p/w500/cZ0d3tCFl1bdqNmPyookat5yNTE.jpg', cover: 'https://image.tmdb.org/t/p/original/jBJWaqoSCiARWtfV0GlqKBHmTDj.jpg', description: 'Geralt of Rivia, a solitary monster hunter, struggles to find his place in a world where people often prove more wicked than beasts.', trailerId: 'ndl1W4ltcmg', genre: 'Fantasy', year: '2019', rating: '91%' },
    ]
  },
  {
    id: 'new',
    title: 'New Releases',
    data: [
      { id: '4', title: 'Avatar: The Way of Water', poster: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg', cover: 'https://image.tmdb.org/t/p/original/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg', description: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora.', trailerId: 'd9MyqF3xDZY', genre: 'Action', year: '2022', rating: '93%' },
      { id: '5', title: 'Top Gun: Maverick', poster: 'https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg', cover: 'https://image.tmdb.org/t/p/original/AaV1YIdWKnjAIAOe8UUKBFm327v.jpg', description: 'After more than thirty years of service as one of the Navy\'s top aviators, and dodging the advancement in rank that would ground him, Pete "Maverick" Mitchell finds himself training a detachment of TOP GUN graduates for a specialized mission the likes of which no living pilot has ever seen.', trailerId: 'giXco2jaZ_4', genre: 'Action', year: '2022', rating: '99%' },
    ]
  },
  {
    id: 'popular',
    title: 'Popular on Novaflix',
    data: [
      { id: '6', title: 'Squid Game', poster: 'https://image.tmdb.org/t/p/w500/dDlE2FcE0sFqg5Z8k8e.jpg', cover: 'https://image.tmdb.org/t/p/original/dDlE2FcE0sFqg5Z8k8e.jpg', description: 'Hundreds of cash-strapped players accept a strange invitation to compete in children\'s games.', trailerId: 'oqxAJKy0ii4', genre: 'Thriller', year: '2021', rating: '97%' },
      { id: '7', title: 'Money Heist', poster: 'https://image.tmdb.org/t/p/w500/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg', cover: 'https://image.tmdb.org/t/p/original/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg', description: 'Eight thieves take hostages and lock themselves in the Royal Mint of Spain.', trailerId: '_InqQJRqGW4', genre: 'Crime', year: '2017', rating: '94%' },
      { id: '8', title: 'Dark', poster: 'https://image.tmdb.org/t/p/w500/scZlQQYnDVlnpxFTfkrroV07A1F.jpg', cover: 'https://image.tmdb.org/t/p/original/scZlQQYnDVlnpxFTfkrroV07A1F.jpg', description: 'A family saga with a supernatural twist, set in a German town.', trailerId: 'rrwycJ08PSA', genre: 'Mystery', year: '2017', rating: '96%' },
    ]
  }
];

export default function HomeScreen() {
  const router = useRouter();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [inCart, setInCart] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFilterResults, setShowFilterResults] = useState(false);
  const [isCategoryMenuOpen, setCategoryMenuOpen] = useState(false);

  const handleAddToCart = (movie: Movie) => {
    addToCart(movie);
    setInCart(prev => ({ ...prev, [movie.id]: true }));
  };

  // Extract unique genres from all movies
  const allGenres = [...new Set(CATEGORIES.flatMap(cat => cat.data.map(m => m.genre)))].sort();
  
  // Get filtered movies based on selected category
  const getFilteredMovies = (): Movie[] => {
    if (!selectedCategory) {
      // Show all movies when no category selected (hero + categories view)
      return [];
    }
    return CATEGORIES.flatMap(cat => cat.data).filter(m => m.genre === selectedCategory);
  };

  // Handle category selection
  const handleCategorySelect = (genre: string) => {
    if (selectedCategory === genre) {
      // Deselect if clicking same category - show hero + categories
      setSelectedCategory('');
      setShowFilterResults(false);
    } else {
      setSelectedCategory(genre);
      setShowFilterResults(true);
    }
    // Close the category menu after selection
    setCategoryMenuOpen(false);
  };

  // Clear filter - show hero + categories
  const clearFilter = () => {
    setSelectedCategory('');
    setShowFilterResults(false);
  };

  const renderMovieItem = ({ item }: { item: Movie }) => (
    <TouchableOpacity 
      style={styles.movieCard}
      onPress={() => setSelectedMovie(item)}
    >
      <Image source={{ uri: item.poster }} style={styles.poster} contentFit="cover" />
    </TouchableOpacity>
  );

  const renderCategory = ({ item }: { item: any }) => (
    <View style={styles.categoryContainer}>
      <ThemedText type="subtitle" style={styles.categoryTitle}>{item.title}</ThemedText>
      <FlatList
        data={item.data}
        renderItem={renderMovieItem}
        keyExtractor={(i) => i.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );

  const featuredMovie = CATEGORIES[0].data[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => setCategoryMenuOpen(!isCategoryMenuOpen)}>
              <Ionicons name="menu" size={30} color="white" />
            </TouchableOpacity>
            <ThemedText type="title" style={styles.logo}>NOVAFLIX</ThemedText>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => router.push('/cart')}>
              <Ionicons name="cart-outline" size={24} color="white" />
              {cartMovies.length > 0 && (
                <View style={styles.cartBadge}>
                  <ThemedText style={styles.cartBadgeText}>{cartMovies.length}</ThemedText>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/admin/login')} style={styles.adminButton}>
              <ThemedText style={styles.adminText}>Admin</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Section (only show when no filter) */}
        {!showFilterResults && (
          <TouchableOpacity onPress={() => setSelectedMovie(featuredMovie)} activeOpacity={0.9}>
            <View style={styles.heroContainer}>
              <Image source={{ uri: featuredMovie.cover }} style={styles.heroImage} contentFit="cover" />
              <View style={styles.heroOverlay}>
                <ThemedText type="title" style={styles.heroTitle}>{featuredMovie.title}</ThemedText>
                <View style={styles.heroButtons}>
                  <TouchableOpacity style={styles.playButton} onPress={() => setSelectedMovie(featuredMovie)}>
                    <Ionicons name="play" size={24} color="black" />
                    <ThemedText style={styles.playButtonText}>Play</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.infoButton} onPress={() => setSelectedMovie(featuredMovie)}>
                    <Ionicons name="information-circle-outline" size={24} color="white" />
                    <ThemedText style={styles.infoButtonText}>Info</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Filtered Results Section */}
        {showFilterResults && (
          <View style={styles.filteredResultsContainer}>
            <View style={styles.filteredResultsHeader}>
              <ThemedText type="subtitle" style={styles.filteredTitle}>
                {selectedCategory}
              </ThemedText>
              <TouchableOpacity onPress={clearFilter} style={styles.showAllButton}>
                <ThemedText style={styles.showAllText}>Show All</ThemedText>
              </TouchableOpacity>
            </View>
            <FlatList
              data={getFilteredMovies()}
              renderItem={renderMovieItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyFilterContainer}>
                  <Ionicons name="film-outline" size={48} color="#444" />
                  <ThemedText style={styles.emptyFilterText}>No movies found in this category</ThemedText>
                </View>
              }
            />
          </View>
        )}

        {/* Categories - Hide when filtering */}
        {!showFilterResults && (
          <View style={styles.categoriesList}>
              {CATEGORIES.map(cat => (
                  <View key={cat.id}>
                      {renderCategory({ item: cat })}
                  </View>
              ))}
          </View>
        )}
        
        <View style={{ height: 50 }} />
      </ScrollView>

      {/* Category Filter Bar (Side Menu) */}
      {isCategoryMenuOpen && (
        <View style={styles.filterContainer}>
          <TouchableOpacity style={styles.closeFilterButton} onPress={() => setCategoryMenuOpen(false)}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <ThemedText style={styles.filterLabel}>Categories</ThemedText>
          <ScrollView
            style={styles.verticalFilterScroll}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.filterScrollContent}
          >
            <TouchableOpacity
              style={[
                styles.filterChip,
                !selectedCategory && styles.filterChipActive
              ]}
              onPress={clearFilter}
            >
              <ThemedText style={[
                styles.filterChipText,
                !selectedCategory && styles.filterChipTextActive
              ]}>
                All
              </ThemedText>
              {!selectedCategory && <Ionicons name="checkmark" size={20} color="white" />}
            </TouchableOpacity>
            {allGenres.map(genre => (
              <TouchableOpacity
                key={genre}
                style={[
                  styles.filterChip,
                  selectedCategory === genre && styles.filterChipActive
                ]}
                onPress={() => handleCategorySelect(genre)}
              >
                <ThemedText style={[
                  styles.filterChipText,
                  selectedCategory === genre && styles.filterChipTextActive
                ]}>
                  {genre}
                </ThemedText>
                {selectedCategory === genre && <Ionicons name="checkmark" size={20} color="white" />}
              </TouchableOpacity>
            ))}
          </ScrollView>
          {selectedCategory && (
            <View style={styles.filterResultInfo}>
              <Ionicons name="film" size={16} color="#E50914" />
              <ThemedText style={styles.filterResultText}>
                {getFilteredMovies().length} movies in "{selectedCategory}"
              </ThemedText>
              <TouchableOpacity onPress={clearFilter} style={styles.clearFilterButton}>
                <Ionicons name="close-circle" size={18} color="#888" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Movie Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!selectedMovie}
        onRequestClose={() => setSelectedMovie(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedMovie(null)}>
              <Ionicons name="close-circle" size={36} color="white" />
            </TouchableOpacity>
            
            {selectedMovie && (
              <ScrollView>
                {/* YouTube Player */}
                <View style={styles.videoContainer}>
                  {Platform.OS === 'web' ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${selectedMovie.trailerId}?autoplay=1`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <Pressable 
                      style={styles.videoPlaceholder}
                      onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${selectedMovie.trailerId}`)}
                    >
                      <Image source={{ uri: selectedMovie.cover }} style={styles.videoPlaceholderImage} contentFit="cover" />
                      <View style={styles.playIconOverlay}>
                        <Ionicons name="play-circle" size={64} color="white" />
                        <ThemedText style={{ color: 'white', marginTop: 8 }}>Watch Trailer</ThemedText>
                      </View>
                    </Pressable>
                  )}
                </View>

                <View style={styles.modalDetails}>
                  <ThemedText type="title" style={styles.modalTitle}>{selectedMovie.title}</ThemedText>
                  <View style={styles.metaRow}>
                    <ThemedText style={styles.matchText}>{selectedMovie.rating} Match</ThemedText>
                    <ThemedText style={styles.yearText}>{selectedMovie.year}</ThemedText>
                    <ThemedText style={styles.genreText}>{selectedMovie.genre}</ThemedText>
                  </View>
                  
                  <View style={styles.modalButtons}>
                    <TouchableOpacity style={styles.modalPlayButton} onPress={() => alert(`Playing ${selectedMovie.title}...`)}>
                      <Ionicons name="play" size={24} color="black" />
                      <ThemedText style={styles.playButtonText}>Play</ThemedText>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.addToListButton, inCart[selectedMovie.id] || cartMovies.find(m => m.id === selectedMovie.id) ? styles.addedButton : {}]}
                      onPress={() => handleAddToCart(selectedMovie)}
                    >
                      <Ionicons 
                        name={inCart[selectedMovie.id] || cartMovies.find(m => m.id === selectedMovie.id) ? "checkmark" : "add"} 
                        size={24} 
                        color="white" 
                      />
                      <ThemedText style={styles.addToListText}>
                        {inCart[selectedMovie.id] || cartMovies.find(m => m.id === selectedMovie.id) ? 'Added' : 'My List'}
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.descriptionContainer}>
                    <ThemedText style={styles.description}>{selectedMovie.description}</ThemedText>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.8)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    color: '#E50914',
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  adminButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E50914',
    borderRadius: 4,
  },
  adminText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#E50914',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  heroContainer: {
    height: 500,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  heroTitle: {
    color: 'white',
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  playButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 4,
    gap: 8,
  },
  playButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoButton: {
    backgroundColor: 'rgba(109, 109, 110, 0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 4,
    gap: 8,
  },
  infoButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoriesList: {
    marginTop: 20,
    paddingBottom: 40,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
    marginBottom: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  movieCard: {
    marginRight: 10,
  },
  poster: {
    width: 130,
    height: 200,
    borderRadius: 6,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#141414',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '92%',
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  videoContainer: {
    width: '100%',
    height: 280,
    backgroundColor: 'black',
    position: 'relative',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
  },
  videoPlaceholderImage: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  playIconOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDetails: {
    padding: 20,
  },
  modalTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  matchText: {
    color: '#46d369',
    fontWeight: 'bold',
    marginRight: 12,
  },
  yearText: {
    color: '#808080',
    marginRight: 12,
  },
  genreText: {
    color: '#808080',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  modalPlayButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 4,
    flex: 1,
    gap: 8,
  },
  addToListButton: {
    backgroundColor: 'rgba(109, 109, 110, 0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 4,
    gap: 8,
  },
  addedButton: {
    backgroundColor: '#46d369',
  },
  addToListText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  descriptionContainer: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 16,
  },
  description: {
    color: '#ddd',
    fontSize: 15,
    lineHeight: 24,
  },
  // Category Filter Styles
  filterContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    bottom: 0,
    width: '50%',
    zIndex: 100,
    backgroundColor: '#0a0a0a',
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: '#222',
  },
  filterLabel: {
    color: '#E50914',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  verticalFilterScroll: {
    flex: 1,
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  filterChip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  filterChipActive: {
    backgroundColor: '#E50914',
    borderColor: '#E50914',
  },
  filterChipText: {
    color: '#aaa',
    fontSize: 16,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: 'white',
  },
  filterResultInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  filterResultText: {
    color: '#888',
    fontSize: 13,
    flex: 1,
  },
  clearFilterButton: {
    padding: 4,
  },
  closeFilterButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
    zIndex: 10,
  },
  // Filtered Results Styles

  filteredResultsContainer: {
    paddingVertical: 20,
  },
  filteredResultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filteredTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  showAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E50914',
    borderRadius: 4,
  },
  showAllText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
  emptyFilterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyFilterText: {
    color: '#666',
    fontSize: 16,
    marginTop: 12,
  },
});
