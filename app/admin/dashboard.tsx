import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Image, Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Simple movie data structure for admin
interface AdminMovie {
  id: string;
  title: string;
  poster: string;
  cover: string;
  description: string;
  trailerId: string;
  genre: string;
  year: string;
  rating: string;
  categoryId?: string;
}

// Category structure
interface Category {
  id: string;
  name: string;
  color: string;
}

const initialMovies: AdminMovie[] = [
  { id: '1', title: 'Stranger Things', poster: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg', cover: 'https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYkJu64HIIV.jpg', description: 'When a young boy vanishes...', trailerId: 'b9EkMc79ZSU', genre: 'Sci-Fi', year: '2022', rating: '98%', categoryId: 'cat1' },
  { id: '2', title: 'Wednesday', poster: 'https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg', cover: 'https://image.tmdb.org/t/p/original/iHSwvRVsRyxpX7FE7GbviaDvgGZ.jpg', description: 'Smart, sarcastic...', trailerId: 'Q73UhUTs6y0', genre: 'Comedy', year: '2022', rating: '95%', categoryId: 'cat2' },
  { id: '3', title: 'The Witcher', poster: 'https://image.tmdb.org/t/p/w500/cZ0d3tCFl1bdqNmPyookat5yNTE.jpg', cover: 'https://image.tmdb.org/t/p/original/jBJWaqoSCiARWtfV0GlqKBHmTDj.jpg', description: 'Geralt of Rivia...', trailerId: 'ndl1W4ltcmg', genre: 'Fantasy', year: '2019', rating: '91%', categoryId: 'cat3' },
  { id: '4', title: 'Avatar: The Way of Water', poster: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg', cover: 'https://image.tmdb.org/t/p/original/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg', description: 'Jake Sully lives...', trailerId: 'd9MyqF3xDZY', genre: 'Action', year: '2022', rating: '93%', categoryId: 'cat4' },
  { id: '5', title: 'Top Gun: Maverick', poster: 'https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg', cover: 'https://image.tmdb.org/t/p/original/AaV1YIdWKnjAIAOe8UUKBFm327v.jpg', description: 'After more than thirty years...', trailerId: 'giXco2jaZ_4', genre: 'Action', year: '2022', rating: '99%', categoryId: 'cat4' },
];

const initialCategories: Category[] = [
  { id: 'cat1', name: 'Trending Now', color: '#E50914' },
  { id: 'cat2', name: 'Comedy', color: '#46d369' },
  { id: 'cat3', name: 'Fantasy', color: '#9c27b0' },
  { id: 'cat4', name: 'Action', color: '#ff9800' },
  { id: 'cat5', name: 'Sci-Fi', color: '#2196f3' },
];

type TabType = 'movies' | 'categories';

export default function AdminDashboard() {
  const router = useRouter();
  const [movies, setMovies] = useState<AdminMovie[]>(initialMovies);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [activeTab, setActiveTab] = useState<TabType>('movies');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const [newMovie, setNewMovie] = useState({
    title: '',
    poster: '',
    cover: '',
    description: '',
    trailerId: '',
    genre: '',
    year: '',
    rating: '',
    categoryId: '',
  });

  const [newCategory, setNewCategory] = useState({ name: '', color: '#E50914' });

  const handleDelete = (id: string) => {
    setMovies(movies.filter(m => m.id !== id));
  };

  const handleAdd = () => {
    if (!newMovie.title) {
      alert('Title is required');
      return;
    }
    const movie: AdminMovie = {
      id: Date.now().toString(),
      ...newMovie,
    };
    setMovies([...movies, movie]);
    setShowAddModal(false);
    setNewMovie({
      title: '',
      poster: '',
      cover: '',
      description: '',
      trailerId: '',
      genre: '',
      year: '',
      rating: '',
      categoryId: '',
    });
  };

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) {
      alert('Category name is required');
      return;
    }
    const category: Category = {
      id: 'cat' + Date.now().toString(),
      name: newCategory.name.trim(),
      color: newCategory.color,
    };
    setCategories([...categories, category]);
    setShowCategoryModal(false);
    setNewCategory({ name: '', color: '#E50914' });
  };

  const handleDeleteCategory = (id: string) => {
    // Remove category
    setCategories(categories.filter(c => c.id !== id));
    // Remove category from movies
    setMovies(movies.map(m => m.categoryId === id ? { ...m, categoryId: '' } : m));
  };

  const handleCategoryChange = (movieId: string, categoryId: string) => {
    setMovies(movies.map(m => m.id === movieId ? { ...m, categoryId } : m));
  };

  const handleLogout = () => {
    router.replace('/admin/login');
  };

  const getCategoryName = (categoryId: string) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : 'Uncategorized';
  };

  const getFilteredMovies = () => {
    if (selectedCategory === 'all') return movies;
    return movies.filter(m => m.categoryId === selectedCategory);
  };

  const renderMovieItem = ({ item }: { item: AdminMovie }) => (
    <View style={styles.movieItem}>
      <Image source={{ uri: item.poster }} style={styles.moviePoster} />
      <View style={styles.movieInfo}>
        <ThemedText type="subtitle" style={styles.movieTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.movieMeta}>{item.year} • {item.genre}</ThemedText>
        <View style={styles.categoryBadge}>
          <ThemedText style={styles.categoryBadgeText}>{getCategoryName(item.categoryId || '')}</ThemedText>
        </View>
        <ThemedText style={styles.movieRating}>Rating: {item.rating}</ThemedText>
      </View>
      <View style={styles.movieActions}>
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => {
            setNewMovie({ ...item, categoryId: item.categoryId || '' });
            setShowAddModal(true);
          }}
        >
          <Ionicons name="create" size={20} color="#2196f3" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash" size={24} color="#ff4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCategoryItem = ({ item }: { item: Category }) => {
    const movieCount = movies.filter(m => m.categoryId === item.id).length;
    return (
      <View style={styles.categoryItem}>
        <View style={[styles.categoryColor, { backgroundColor: item.color }]} />
        <View style={styles.categoryInfo}>
          <ThemedText type="subtitle" style={styles.categoryName}>{item.name}</ThemedText>
          <ThemedText style={styles.categoryCount}>{movieCount} movies</ThemedText>
        </View>
        <View style={styles.categoryActions}>
          <TouchableOpacity 
            style={styles.categoryEditButton}
            onPress={() => {
              setNewCategory({ name: item.name, color: item.color });
              setShowCategoryModal(true);
              setCategories(categories.filter(c => c.id !== item.id));
            }}
          >
            <Ionicons name="create" size={18} color="#2196f3" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.categoryDeleteButton} 
            onPress={() => handleDeleteCategory(item.id)}
          >
            <Ionicons name="trash" size={20} color="#ff4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>Admin Dashboard</ThemedText>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={22} color="white" />
          <ThemedText style={styles.logoutText}>Logout</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <ThemedText style={styles.statNumber}>{movies.length}</ThemedText>
          <ThemedText style={styles.statLabel}>Total Movies</ThemedText>
        </View>
        <View style={styles.statCard}>
          <ThemedText style={styles.statNumber}>{categories.length}</ThemedText>
          <ThemedText style={styles.statLabel}>Categories</ThemedText>
        </View>
        <View style={styles.statCard}>
          <ThemedText style={styles.statNumber}>{movies.filter(m => parseInt(m.rating) > 95).length}</ThemedText>
          <ThemedText style={styles.statLabel}>Top Rated</ThemedText>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'movies' && styles.activeTab]}
          onPress={() => setActiveTab('movies')}
        >
          <Ionicons name="film" size={20} color={activeTab === 'movies' ? '#E50914' : '#888'} />
          <ThemedText style={[styles.tabText, activeTab === 'movies' && styles.activeTabText]}>
            Movies
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'categories' && styles.activeTab]}
          onPress={() => setActiveTab('categories')}
        >
          <Ionicons name="list" size={20} color={activeTab === 'categories' ? '#E50914' : '#888'} />
          <ThemedText style={[styles.tabText, activeTab === 'categories' && styles.activeTabText]}>
            Categories
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Movies Tab Content */}
      {activeTab === 'movies' && (
        <>
          <View style={styles.listHeader}>
            <ThemedText type="subtitle">Manage Movies</ThemedText>
            <View style={styles.filterRow}>
              <View style={styles.categoryFilter}>
                <Ionicons name="funnel" size={16} color="#888" />
                <TextInput
                  style={styles.filterInput}
                  value={selectedCategory}
                  editable={false}
                  placeholder="All Categories"
                  placeholderTextColor="#666"
                />
                <TouchableOpacity 
                  style={styles.filterDropdown}
                  onPress={() => {}}
                >
                  <FlatList
                    data={[{ id: 'all', name: 'All', color: '#888' }, ...categories]}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.dropdownItem}
                        onPress={() => setSelectedCategory(item.id)}
                      >
                        <View style={[styles.dropdownColor, { backgroundColor: item.color }]} />
                        <ThemedText style={styles.dropdownItemText}>{item.name}</ThemedText>
                        {selectedCategory === item.id && (
                          <Ionicons name="checkmark" size={16} color="#E50914" />
                        )}
                      </TouchableOpacity>
                    )}
                    style={styles.dropdownList}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <FlatList
            data={getFilteredMovies()}
            renderItem={renderMovieItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="film-outline" size={48} color="#444" />
                <ThemedText style={styles.emptyText}>No movies found</ThemedText>
              </View>
            }
          />
        </>
      )}

      {/* Categories Tab Content */}
      {activeTab === 'categories' && (
        <>
          <View style={styles.listHeader}>
            <ThemedText type="subtitle">Manage Categories</ThemedText>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowCategoryModal(true)}>
              <Ionicons name="add" size={24} color="white" />
              <ThemedText style={styles.addButtonText}>Add Category</ThemedText>
            </TouchableOpacity>
          </View>

          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="list-outline" size={48} color="#444" />
                <ThemedText style={styles.emptyText}>No categories found</ThemedText>
              </View>
            }
          />
        </>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => {
          if (activeTab === 'movies') {
            setNewMovie({
              title: '',
              poster: '',
              cover: '',
              description: '',
              trailerId: '',
              genre: '',
              year: '',
              rating: '',
              categoryId: selectedCategory !== 'all' ? selectedCategory : '',
            });
            setShowAddModal(true);
          } else {
            setNewCategory({ name: '', color: '#E50914' });
            setShowCategoryModal(true);
          }
        }}
      >
        <Ionicons name={activeTab === 'movies' ? 'add' : 'add'} size={28} color="white" />
      </TouchableOpacity>

      {/* Add/Edit Movie Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="title">Add New Movie</ThemedText>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={28} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.formScroll}>
              <ThemedText style={styles.label}>Title *</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Movie title"
                placeholderTextColor="#666"
                value={newMovie.title}
                onChangeText={(text) => setNewMovie({ ...newMovie, title: text })}
              />

              <ThemedText style={styles.label}>Poster URL</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="https://..."
                placeholderTextColor="#666"
                value={newMovie.poster}
                onChangeText={(text) => setNewMovie({ ...newMovie, poster: text })}
              />

              <ThemedText style={styles.label}>Cover URL</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="https://..."
                placeholderTextColor="#666"
                value={newMovie.cover}
                onChangeText={(text) => setNewMovie({ ...newMovie, cover: text })}
              />

              <ThemedText style={styles.label}>Trailer ID (YouTube)</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="e.g., b9EkMc79ZSU"
                placeholderTextColor="#666"
                value={newMovie.trailerId}
                onChangeText={(text) => setNewMovie({ ...newMovie, trailerId: text })}
              />

              <ThemedText style={styles.label}>Genre</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Action, Comedy, Drama..."
                placeholderTextColor="#666"
                value={newMovie.genre}
                onChangeText={(text) => setNewMovie({ ...newMovie, genre: text })}
              />

              <ThemedText style={styles.label}>Category</ThemedText>
              <View style={styles.categoryPicker}>
                <FlatList
                  horizontal
                  data={categories}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.categoryChip,
                        { borderColor: item.color },
                        newMovie.categoryId === item.id && { backgroundColor: item.color }
                      ]}
                      onPress={() => setNewMovie({ ...newMovie, categoryId: item.id })}
                    >
                      <ThemedText
                        style={[
                          styles.categoryChipText,
                          newMovie.categoryId === item.id && { color: 'white' }
                        ]}
                      >
                        {item.name}
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                  showsHorizontalScrollIndicator={false}
                />
              </View>

              <ThemedText style={styles.label}>Year</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="2024"
                placeholderTextColor="#666"
                value={newMovie.year}
                onChangeText={(text) => setNewMovie({ ...newMovie, year: text })}
              />

              <ThemedText style={styles.label}>Rating</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="95%"
                placeholderTextColor="#666"
                value={newMovie.rating}
                onChangeText={(text) => setNewMovie({ ...newMovie, rating: text })}
              />

              <ThemedText style={styles.label}>Description</ThemedText>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Movie description..."
                placeholderTextColor="#666"
                value={newMovie.description}
                onChangeText={(text) => setNewMovie({ ...newMovie, description: text })}
                multiline
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddModal(false)}>
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleAdd}>
                <ThemedText style={styles.saveButtonText}>Add Movie</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add/Edit Category Modal */}
      <Modal visible={showCategoryModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '50%' }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="title">Add New Category</ThemedText>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={28} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.formScroll}>
              <ThemedText style={styles.label}>Category Name *</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="e.g., Horror, Romance..."
                placeholderTextColor="#666"
                value={newCategory.name}
                onChangeText={(text) => setNewCategory({ ...newCategory, name: text })}
              />

              <ThemedText style={styles.label}>Category Color</ThemedText>
              <View style={styles.colorPicker}>
                {['#E50914', '#46d369', '#9c27b0', '#ff9800', '#2196f3', '#00bcd4', '#e91e63', '#ffc107'].map(color => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      newCategory.color === color && styles.selectedColor
                    ]}
                    onPress={() => setNewCategory({ ...newCategory, color })}
                  >
                    {newCategory.color === color && <Ionicons name="checkmark" size={20} color="white" />}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowCategoryModal(false)}>
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddCategory}>
                <ThemedText style={styles.saveButtonText}>Add Category</ThemedText>
              </TouchableOpacity>
            </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#E50914',
    borderRadius: 6,
  },
  logoutText: {
    color: 'white',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    color: '#E50914',
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
  },
  activeTab: {
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    borderWidth: 1,
    borderColor: '#E50914',
  },
  tabText: {
    color: '#888',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#E50914',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterInput: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
    minWidth: 100,
  },
  filterDropdown: {
    marginLeft: 8,
  },
  dropdownList: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  dropdownColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  dropdownItemText: {
    flex: 1,
    color: '#fff',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E50914',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#666',
    marginTop: 12,
    fontSize: 16,
  },
  movieItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  moviePoster: {
    width: 60,
    height: 90,
    borderRadius: 6,
  },
  movieInfo: {
    flex: 1,
    marginLeft: 12,
  },
  movieTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  movieMeta: {
    color: '#888',
    fontSize: 13,
    marginTop: 4,
  },
  categoryBadge: {
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  categoryBadgeText: {
    color: '#aaa',
    fontSize: 11,
  },
  movieRating: {
    color: '#46d369',
    fontSize: 12,
    marginTop: 4,
  },
  movieActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  categoryColor: {
    width: 8,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryCount: {
    color: '#888',
    fontSize: 13,
    marginTop: 2,
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryEditButton: {
    padding: 8,
  },
  categoryDeleteButton: {
    padding: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  formScroll: {
    padding: 20,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryPicker: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  categoryChipText: {
    color: '#fff',
    fontSize: 13,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#333',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#E50914',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

