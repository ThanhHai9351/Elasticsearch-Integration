import { Client } from '@elastic/elasticsearch';

export const esClient = new Client({
  node: 'http://localhost:9200',
  auth: { username: 'elastic', password: 'elastic' },
  requestTimeout: 30000,
  maxRetries: 3,
  resurrectStrategy: 'ping',
});

export async function checkElasticsearchConnection() {
  try {
    const health = await esClient.cluster.health({});
    if (health && health.body && health.body.status) {
      console.log(`✅ Elasticsearch cluster status: ${health.body.status}`);
      return true;
    } else {
      console.log('⚠️ Không thể lấy trạng thái cluster từ Elasticsearch.');
      return false;
    }
  } catch (error) {
    console.error('❌ Không thể kết nối tới Elasticsearch:', (error as Error).message);
    return false;
  }
}

export async function createProductsIndex() {
  try {
    const indexExists = await esClient.indices.exists({ index: 'products' });
    
    if (!indexExists) {
      await esClient.indices.create({
        index: 'products',
        body: {
          mappings: {
            properties: {
              name: {
                type: 'text',
                analyzer: 'standard',
                fields: {
                  keyword: {
                    type: 'keyword'
                  }
                }
              },
              brand: {
                type: 'text',
                analyzer: 'standard',
                fields: {
                  keyword: {
                    type: 'keyword'
                  }
                }
              },
              price: {
                type: 'float'
              },
              category: {
                type: 'text',
                analyzer: 'standard',
                fields: {
                  keyword: {
                    type: 'keyword'
                  }
                }
              },
              color: {
                type: 'text',
                analyzer: 'standard',
                fields: {
                  keyword: {
                    type: 'keyword'
                  }
                }
              },
              size: {
                type: 'text',
                analyzer: 'standard',
                fields: {
                  keyword: {
                    type: 'keyword'
                  }
                }
              },
              description: {
                type: 'text',
                analyzer: 'standard'
              },
              createdAt: {
                type: 'date'
              },
              updatedAt: {
                type: 'date'
              }
            }
          },
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0,
            analysis: {
              analyzer: {
                custom_analyzer: {
                  type: 'custom',
                  tokenizer: 'standard',
                  filter: ['lowercase', 'stop']
                }
              }
            }
          }
        }
      });
      console.log('✅ Created products index with mappings');
    } else {
      console.log('ℹ️ Products index already exists');
    }
  } catch (error) {
    console.error('❌ Error creating products index:', (error as Error).message);
    throw error;
  }
}
  
