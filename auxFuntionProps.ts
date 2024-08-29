import axios from 'axios';

const consumerKey = 'ck_aaae303d49b4ac57c713472aca2f610d4c99e195';
const consumerSecret = 'cs_646f2fd371adc5d405a5a7bb9a464909e94a0c75';

interface Category {
    id: number;
    name: string;
    parent: number;
    count: number;
}

export async function getUniqueCategories(): Promise<Category[]> {
    try {
        const response = await axios.get<Category[]>('https://solutelcuba.com/wp-json/wc/v3/products/categories', {
          params: {
            parent: 0,
            per_page: 100,
          },  
          auth: {
              username: consumerKey,
              password: consumerSecret,
            },
          });
          const categories = response.data;

          // Filtrar las categorías donde count > 0 y recolectar categorías únicas
          const uniqueCategories = categories.filter(category => category.count > 0);

          return uniqueCategories;
      } catch (error) {
          console.error('Error al obtener las categorías:', error);
          return [];
      }
  }
