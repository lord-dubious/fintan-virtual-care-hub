import { prisma, createEmbedding, findSimilarEntries } from '../lib/prisma';

/**
 * Example functions demonstrating how to use Prisma with Neon
 */

// Create a new user
export async function createUser(email: string, name: string) {
  try {
    const user = await prisma.user.create({
      data: {
        email,
        name,
      },
    });
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Create a brain entry with vector embedding
export async function createBrainEntry(userId: string, content: string, categoryId?: string) {
  try {
    // Generate embedding vector for the content
    const embedding = await createEmbedding(content);
    
    const entry = await prisma.brainEntry.create({
      data: {
        userId,
        content,
        categoryId,
        embedding,
        metadata: {
          source: 'manual',
          timestamp: new Date().toISOString(),
        },
      },
    });
    
    return entry;
  } catch (error) {
    console.error('Error creating brain entry:', error);
    throw error;
  }
}

// Find similar brain entries using vector similarity
export async function searchSimilarContent(content: string, limit = 5) {
  try {
    // Generate embedding for the search query
    const embedding = await createEmbedding(content);
    
    // Find similar entries using vector similarity
    const similarEntries = await findSimilarEntries(embedding, limit);
    
    return similarEntries;
  } catch (error) {
    console.error('Error searching similar content:', error);
    throw error;
  }
}

// Example of a transaction with Neon
export async function createUserWithCategory(email: string, name: string, categoryName: string) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          name,
        },
      });
      
      // Create category for the user
      const category = await tx.category.create({
        data: {
          userId: user.id,
          name: categoryName,
          color: '#' + Math.floor(Math.random() * 16777215).toString(16), // Random color
        },
      });
      
      return { user, category };
    });
    
    return result;
  } catch (error) {
    console.error('Error in transaction:', error);
    throw error;
  }
}

