import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const BASE_URL = 'https://takeuforward.org/blogs';

const BLOG_DATA = {
  'Arrays': {
    count: 252,
    articles: [
      'Convert an array to a Linked List',
      'Search in a row and column-wise sorted matrix',
      'Find the row with maximum number of 1s',
      'Kth Missing Positive Number',
      'Minimise Maximum Distance between Gas Stations',
      'Capacity to Ship Packages within D Days',
      'Split Array - Largest Sum',
      'Koko Eating Bananas',
      'Aggressive Cows',
      'Book Allocation Problem',
    ],
  },
  'Introduction to DSA': {
    count: 15,
    articles: [
      'What is Data Structure?',
      'What is an Algorithm?',
      'Time Complexity and Space Complexity',
      'Best, Worst, and Average Case Analysis',
      'Asymptotic Notations',
      'Big O Notation',
      'Recursion Basics',
    ],
  },
  'Binary Search': {
    count: 37,
    articles: [
      'Find Peak Element-II',
      'Search in a row and column-wise sorted matrix',
      'Find the row with maximum number of 1s',
      'Painters Partition Problem',
      'Kth Missing Positive Number',
      'Capacity to Ship Packages within D Days',
      'Minimise Maximum Distance between Gas Stations',
      'Split Array - Largest Sum',
      'Find out how many times the array has been rotated',
      'Minimum days to make M bouquets',
    ],
  },
  'Binary Search Tree': {
    count: 20,
    articles: [
      'Largest BST in Binary Tree',
      'Binary Search Tree Iterator',
      'Floor in a Binary Search Tree',
      'Ceil in a Binary Search Tree',
      'Insert a Given Node in BST',
      'Delete a Node in BST',
      'Kth Smallest Element in BST',
      'Validate Binary Search Tree',
      'LCA of Binary Search Tree',
      'Construct BST from Preorder Traversal',
    ],
  },
  'Binary Tree': {
    count: 47,
    articles: [
      'Requirements needed to construct a Unique Binary Tree',
      'Iterative Postorder Traversal Using 1 Stack',
      'Iterative Inorder Traversal of Binary Tree',
      'Iterative Preorder Traversal of Binary Tree',
      'Iterative Postorder Traversal Using 2 Stacks',
      'Print Nodes at Distance K in a Binary Tree',
      'Binary Tree Representation in C++',
      'Binary Tree Representation in Java',
      'Maximum Path Sum in Binary Tree',
      'Boundary Traversal of Binary Tree',
    ],
  },
  'Bit Manipulation': {
    count: 18,
    articles: [
      'Introduction to Bit Manipulation',
      'Check if a number is odd or even',
      'Check if ith bit is set or not',
      'Set/Unset the ith bit',
      'Toggle the ith bit',
      'Count set bits (Brian Kernighans Algorithm)',
      'Power of Two',
      'Single Number (XOR)',
      'Divide Two Integers without multiplication',
      'Find XOR of numbers from L to R',
    ],
  },
  'C++': {
    count: 30,
    articles: [
      'C++ STL Tutorial',
      'Vectors in C++ STL',
      'Maps in C++ STL',
      'Sets in C++ STL',
      'Pairs in C++',
      'Strings in C++',
      'Priority Queue in C++ STL',
      'Stack in C++ STL',
      'Queue in C++ STL',
      'Deque in C++ STL',
    ],
  },
  'CS Core': {
    count: 25,
    articles: [
      'Operating System Basics',
      'Process vs Thread',
      'CPU Scheduling Algorithms',
      'Deadlock in Operating System',
      'Virtual Memory',
      'DBMS Introduction',
      'Normalization in DBMS',
      'ACID Properties',
      'Computer Network Basics',
      'OSI Model',
    ],
  },
  'Data Structures': {
    count: 35,
    articles: [
      'Introduction to Data Structures',
      'Arrays - Introduction',
      'Linked List - Introduction',
      'Stack - Introduction',
      'Queue - Introduction',
      'Binary Tree - Introduction',
      'Binary Search Tree - Introduction',
      'Heap - Introduction',
      'Graph - Introduction',
      'Trie - Introduction',
    ],
  },
  'Dynamic Programming': {
    count: 62,
    articles: [
      'Maximum Rectangle Area with all 1s | DP 55',
      'Partition Array for Maximum Sum | DP 54',
      'Count Square Submatrices with All 1s | DP 56',
      'Palindrome Partitioning - II | DP 53',
      'Burst Balloons | Partition DP | DP 51',
      'Evaluate Boolean Expression to True | DP 52',
      'Minimum cost to cut the stick | DP 50',
      'Matrix Chain Multiplication | Tabulation | DP 49',
      'Matrix Chain Multiplication | DP 48',
      'Number of Longest Increasing Subsequences | DP 47',
    ],
  },
  'Graph': {
    count: 70,
    articles: [
      'Minimum Multiplications to Reach End | G-39',
      'Cheapest Flights Within K Stops | G-38',
      'Number of Ways to Arrive at Destination | G-40',
      'Shortest Distance in a Binary Maze | G-36',
      'Bridges in Graph - Tarjans Algorithm | G-55',
      'Articulation Point in Graph | G-56',
      'Path With Minimum Effort | G-37',
      'Strongly Connected Components - Kosarajus | G-54',
      'Most Stones Removed with Same Row or Column | G-53',
      'Number of Islands - II Online Queries | G-51',
    ],
  },
  'Greedy': {
    count: 15,
    articles: [
      'Assign Cookies',
      'Fractional Knapsack Problem',
      'Job Sequencing Problem',
      'N Meetings in One Room',
      'Minimum Number of Platforms',
      'Lemonade Change',
      'Valid Parenthesis String',
      'Jump Game',
      'Jump Game II',
      'Minimum Coins',
    ],
  },
  'Hashing': {
    count: 12,
    articles: [
      'Introduction to Hashing',
      'Counting Frequencies of Array Elements',
      'Highest/Lowest Frequency Element',
      'Two Sum Problem',
      'Longest Subarray with given Sum',
      'Longest Consecutive Sequence',
      'Count Subarrays with Given XOR',
      'Longest Substring Without Repeating Characters',
      'Group Anagrams',
      'Subarrays with Sum K',
    ],
  },
  'Heap': {
    count: 15,
    articles: [
      'Introduction to Priority Queue / Heap',
      'Min Heap and Max Heap Implementation',
      'Kth Largest Element in an Array',
      'Top K Frequent Elements',
      'Find Median from Data Stream',
      'Merge K Sorted Lists',
      'Task Scheduler',
      'Hand of Straights',
      'Kth Smallest Element',
      'Sort K Sorted Array',
    ],
  },
  'Interview Experience': {
    count: 40,
    articles: [
      'Google Interview Experience',
      'Amazon Interview Experience',
      'Microsoft Interview Experience',
      'Facebook/Meta Interview Experience',
      'Flipkart Interview Experience',
      'Goldman Sachs Interview Experience',
      'Uber Interview Experience',
      'Adobe Interview Experience',
      'Atlassian Interview Experience',
      'Samsung Interview Experience',
    ],
  },
  'Java': {
    count: 25,
    articles: [
      'Java Collections Framework',
      'ArrayList in Java',
      'HashMap in Java',
      'HashSet in Java',
      'LinkedList in Java',
      'PriorityQueue in Java',
      'Stack in Java',
      'Queue in Java',
      'TreeMap in Java',
      'Comparable vs Comparator',
    ],
  },
  'Javascript': {
    count: 10,
    articles: [
      'JavaScript Basics for DSA',
      'Arrays in JavaScript',
      'Objects and Maps',
      'Set in JavaScript',
      'String Methods',
      'Sorting in JavaScript',
      'Closures and Callbacks',
    ],
  },
  'Linked List': {
    count: 72,
    articles: [
      'Merge K Sorted Lists',
      'Design a Browser History',
      'Sort a Linked List',
      'Length of Loop in Linked List',
      'Delete the Middle Node of the Linked List',
      'Top LinkedList Interview Questions',
      'Delete the kth element of a Linked List',
      'Insert before the Kth element',
      'Insert before the node with Value X',
      'Insert at the head of a Linked List',
    ],
  },
  'Maths': {
    count: 20,
    articles: [
      'Count Digits of a Number',
      'Reverse a Number',
      'Check Palindrome Number',
      'GCD of Two Numbers',
      'Armstrong Number',
      'Print all Divisors',
      'Check for Prime',
      'Power of a Number',
      'Sieve of Eratosthenes',
      'Modular Arithmetic',
    ],
  },
  'Python': {
    count: 15,
    articles: [
      'Python Basics for DSA',
      'Lists in Python',
      'Dictionaries in Python',
      'Sets in Python',
      'Tuples in Python',
      'String Operations',
      'List Comprehensions',
      'Lambda Functions',
      'Sorting in Python',
      'Collections Module',
    ],
  },
  'Queue': {
    count: 10,
    articles: [
      'Introduction to Queue',
      'Queue using Array',
      'Queue using Linked List',
      'Implement Queue using Stacks',
      'Circular Queue',
      'Deque Introduction',
      'Sliding Window Maximum',
      'Rotten Oranges',
      'First Non-Repeating Character in Stream',
    ],
  },
  'Recursion': {
    count: 112,
    articles: [
      'Introduction to Recursion',
      'Print Name N times using Recursion',
      'Print N to 1 using Recursion',
      'Print 1 to N using Recursion',
      'Sum of first N numbers',
      'Factorial of a Number',
      'Reverse an Array using Recursion',
      'Check if String is Palindrome',
      'Fibonacci Number',
      'Subset Sum Problem',
    ],
  },
  'Sliding Window': {
    count: 10,
    articles: [
      'Longest Substring Without Repeating Characters',
      'Max Consecutive Ones III',
      'Fruit Into Baskets',
      'Longest Repeating Character Replacement',
      'Binary Subarrays With Sum',
      'Count Number of Nice Subarrays',
      'Minimum Window Substring',
      'Subarrays with K Different Integers',
    ],
  },
  'Sorting': {
    count: 12,
    articles: [
      'Selection Sort',
      'Bubble Sort',
      'Insertion Sort',
      'Merge Sort',
      'Quick Sort',
      'Counting Sort',
      'Radix Sort',
      'Heap Sort',
      'Recursive Bubble Sort',
      'Recursive Insertion Sort',
    ],
  },
  'Stack': {
    count: 20,
    articles: [
      'Stack in C++ STL',
      'Implement K stacks in a single Array',
      'Two stacks in an array',
      'Evaluation of Postfix Expression',
      'Implement stack using linked list',
      'Evaluation of Prefix expression',
      'Infix, Prefix, and Postfix Introduction',
      'Infix to Prefix',
      'Infix to Postfix',
      'Applications of Stack',
    ],
  },
  'String': {
    count: 57,
    articles: [
      'Understanding Strings',
      'Palindromic Substrings',
      'Minimum Window Substring',
      'Longest String Chain | DP 45',
      'Word Search - Leetcode',
      'Lexicographic Rank of a String',
      'Reverse String in C',
      'String Concatenation in C',
      'Rabin Karp Algorithm - Pattern Searching',
      'KMP Algorithm',
    ],
  },
  'Trie': {
    count: 8,
    articles: [
      'Implement Trie - Prefix Tree',
      'Implement Trie II',
      'Longest Word with All Prefixes',
      'Count Distinct Substrings',
      'Maximum XOR of Two Numbers',
      'Maximum XOR With Element From Array',
      'Number of Distinct Substrings in a String',
      'Power Set using Trie',
    ],
  },
  'Two Pointer': {
    count: 10,
    articles: [
      'Two Sum Problem',
      '3 Sum Problem',
      '4 Sum Problem',
      'Container With Most Water',
      'Trapping Rain Water',
      'Remove Duplicates from Sorted Array',
      'Sort Colors (Dutch National Flag)',
      'Move Zeros to End',
    ],
  },
};

export default function BlogScreen({ route }) {
  const { category } = route.params;
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  const data = BLOG_DATA[category] || { count: 0, articles: [] };
  const slug = category.toLowerCase().replace(/\s+/g, '-');

  const openArticle = (title) => {
    Linking.openURL(`${BASE_URL}/${slug}`);
  };

  const openAllArticles = () => {
    Linking.openURL(`${BASE_URL}/${slug}`);
  };

  const renderArticle = ({ item, index }) => (
    <TouchableOpacity
      style={[styles.articleCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}
      onPress={() => openArticle(item)}
      activeOpacity={0.7}
    >
      <View style={styles.articleLeft}>
        <View style={[styles.articleNumber, { backgroundColor: theme.surfaceLight }]}>
          <Text style={[styles.articleNumberText, { color: theme.textMuted }]}>{index + 1}</Text>
        </View>
        <Text style={[styles.articleTitle, { color: theme.headingColor }]} numberOfLines={2}>{item}</Text>
      </View>
      <Ionicons name="open-outline" size={18} color={theme.textMuted} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.cardBg, borderBottomColor: theme.cardBorder }]}>
        <Text style={[styles.headerTitle, { color: theme.headingColor }]}>{category}</Text>
        <Text style={[styles.headerCount, { color: theme.primary }]}>{data.count} articles</Text>
      </View>

      {/* Articles */}
      <FlatList
        data={data.articles}
        renderItem={renderArticle}
        keyExtractor={(item, i) => i.toString()}
        contentContainerStyle={styles.list}
        ListFooterComponent={
          data.count > data.articles.length ? (
            <TouchableOpacity style={[styles.viewAllBtn, { borderColor: theme.primary }]} onPress={openAllArticles}>
              <Text style={[styles.viewAllText, { color: theme.primary }]}>
                View all {data.count} articles on takeUforward
              </Text>
              <Ionicons name="arrow-forward" size={16} color={theme.primary} />
            </TouchableOpacity>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121219',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1C1C2B',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A3D',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerCount: {
    fontSize: 14,
    color: '#7C5CFC',
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  articleCard: {
    backgroundColor: '#1C1C2B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#2A2A3D',
  },
  articleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  articleNumber: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#2A2A3D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  articleNumberText: {
    color: '#8A8A9A',
    fontSize: 13,
    fontWeight: '700',
  },
  articleTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginTop: 8,
    backgroundColor: '#1C1C2B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#7C5CFC',
  },
  viewAllText: {
    color: '#7C5CFC',
    fontSize: 14,
    fontWeight: '600',
  },
});
