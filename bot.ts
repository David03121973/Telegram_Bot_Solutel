const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const { getUniqueCategories } = require("./auxFuntionProps");
const cheerio = require("cheerio");

const token = "7074935867:AAFViPFwOxHa_wPc3cuGF1AWeFk2NC52GHc";
const bot = new TelegramBot(token, { polling: true });

const consumerKey = "ck_aaae303d49b4ac57c713472aca2f610d4c99e195";
const consumerSecret = "cs_646f2fd371adc5d405a5a7bb9a464909e94a0c75";

let currentSearchOption = ""; // Para rastrear la opción de búsqueda seleccionada
let selectedCategory = null; // Para almacenar la categoría seleccionada

// Manejar el comando /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `💻📱<b>Bienvenidos a nuestra tienda online</b>💾⌚️`,
    { parse_mode: "HTML" }
  );
  bot.sendMessage(chatId, "🔍¿Cómo te gustaría buscar?", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "⌨️ Buscar por nombre", callback_data: "search_by_name" }],
        [
          {
            text: "✅ Buscar por categoría",
            callback_data: "search_by_category",
          },
        ],
        [
          {
            text: "✍️ Buscar por categoría y nombre",
            callback_data: "search_by_category_and_name",
          },
        ],
      ],
    },
  });
});

// Manejar la selección de la opción de búsqueda
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const option = query.data;

  if (option === "search_by_name") {
    currentSearchOption = "name";
    bot.sendMessage(chatId, "Por favor, ingresa el nombre del producto:");
  } else if (option === "search_by_category") {
    currentSearchOption = "category";
    await listCategories(chatId);
  } else if (option === "search_by_category_and_name") {
    currentSearchOption = "category_and_name";
    await listCategories(chatId);
  }
});

// Manejar el mensaje del usuario para las búsquedas
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Evitar que se ejecute la búsqueda cuando el usuario envía comandos como /start
  if (text.startsWith("/")) return;

  if (currentSearchOption === "name") {
    await searchByName(chatId, text);
  } else if (currentSearchOption === "category_and_name" && selectedCategory) {
    await searchByCategoryAndName(chatId, selectedCategory, text);
  } else {
    bot.sendMessage(
      chatId,
      "Por favor, selecciona una opción de búsqueda primero."
    );
  }
});

// Función para listar las categorías principales
async function listCategories(chatId: number) {
  try {
    const categories = await getUniqueCategories();

    // Verifica que las categorías se estén obteniendo correctamente
    if (!categories || categories.length === 0) {
      bot.sendMessage(chatId, "No se encontraron categorías.");
      return;
    }

    // Objeto de mapeo para las sustituciones de nombres
    const categoryNameMap: { [key: string]: string } = {
      Accesorios: "🎒 Accesorios",
      Almacenamiento: "💾 Almacenamiento",
      Audífonos: "🎧 Audífonos",
      "Bocinas Bluetooth": "🔊Bocinas Bluetooth",
      "Cargadores y cables": "🔋 Cargadores y cables",
      Celulares: "📱 Celulares",
      "Equipos Tech": "🕹 Equipos Tech",
      "Laptops y PCs": "💻 Laptops y PCs",
      Pantallas: "📲 Pantallas",
      "Periféricos PC": "⚙️ Periféricos PC",
    };

    // Mapear las categorías para construir los botones inline
    const categoryButtons: Array<{ text: string; callback_data: string }> =
      categories.map((cat) => ({
        text: categoryNameMap[cat.name] || cat.name,
        callback_data: `category_${cat.id}`,
      }));

    // Declarar el teclado como un array de arrays de botones
    const keyboard: Array<Array<{ text: string; callback_data: string }>> = [];

    // Agrupar los botones en filas de 2
    for (let i = 0; i < categoryButtons.length; i += 2) {
      keyboard.push(categoryButtons.slice(i, i + 2));
    }

    bot.sendMessage(chatId, "☑️ Selecciona una categoría:", {
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  } catch (error) {
    console.error("Error al obtener las categorías:", error);
    bot.sendMessage(chatId, "Hubo un error al obtener las categorías.");
  }
}

bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data.startsWith("category_")) {
    selectedCategory = data.split("_")[1];

    if (currentSearchOption === "category") {
      // Verifica que selectedCategory no sea null o undefined
      if (selectedCategory) {
        const categoryId = parseInt(selectedCategory);
        if (!isNaN(categoryId)) {
          await listChildCategories(chatId, categoryId);
        } else {
          bot.sendMessage(chatId, "ID de categoría inválido.");
        }
      } else {
        bot.sendMessage(chatId, "No se ha seleccionado ninguna categoría.");
      }
    } else if (currentSearchOption === "category_and_name") {
      bot.sendMessage(chatId, "Por favor, ingresa el nombre del producto:");
    }
  } else if (data.startsWith("subcategory_")) {
    const selectedSubCategoryId = data.split("_")[1];

    if (currentSearchOption === "category") {
      // Buscar productos en la subcategoría seleccionada
      await searchByCategory(chatId, selectedSubCategoryId);
    } else if (currentSearchOption === "category_and_name") {
      bot.sendMessage(chatId, "Por favor, ingresa el nombre del producto:");
    }
  }
});

// Función para buscar por nombre
async function searchByName(chatId: string, name: string) {
    let allProducts: any[] = [];
    const perPage = 100; // Número máximo de productos por página
    let page = 1;
    let totalPages = 1; // Inicialmente se establece en 1 para entrar en el bucle
    
  try {
    while (page <= totalPages) {
        const response = await axios.get(
          `https://solutelcuba.com/wp-json/wc/v3/products`,
          {
            params: {
              per_page: perPage,
              page: page,
              search: name
            },
            auth: {
              username: consumerKey,
              password: consumerSecret,
            },
          }
        );
  
        // Concatenar los productos obtenidos con los productos ya obtenidos
        allProducts = allProducts.concat(response.data);
  
        // Actualizar el total de páginas si es la primera solicitud
        if (page === 1) {
          totalPages = parseInt(response.headers['x-wp-totalpages'], 10) || 1;
        }
  
        // Incrementar el número de página para la siguiente solicitud
        page++;
    }

    // Filtrar los productos que coincidan exactamente con el nombre
    const filteredProducts = allProducts.filter((product: any) =>
      product.name.toLowerCase().includes(name.toLowerCase())
    );

    // Manejar la respuesta de búsqueda de productos
    await handleProductSearchResponse(chatId, filteredProducts);
  } catch (error) {
    console.error("Error al buscar el producto:", error);
    bot.sendMessage(chatId, "Hubo un error al buscar el producto.");
  }
}

// Función para buscar por categoría y nombre
async function searchByCategoryAndName(chatId, categoryId, name) {
    let allProducts: any[] = [];
    const perPage = 100; // Número máximo de productos por página
    let page = 1;
    let totalPages = 1; // Inicialmente se establece en 1 para entrar en el bucle
    
  try {
    while (page <= totalPages) {
        const response = await axios.get(
          `https://solutelcuba.com/wp-json/wc/v3/products`,
          {
            params: {
              per_page: perPage,
              page: page,
              search: name,
              categories: categoryId,
            },
            auth: {
              username: consumerKey,
              password: consumerSecret,
            },
          }
        );
  
        // Concatenar los productos obtenidos con los productos ya obtenidos
        allProducts = allProducts.concat(response.data);
  
        // Actualizar el total de páginas si es la primera solicitud
        if (page === 1) {
          totalPages = parseInt(response.headers['x-wp-totalpages'], 10) || 1;
        }
  
        // Incrementar el número de página para la siguiente solicitud
        page++;
    }

    // Filtrar los productos que coincidan exactamente con el nombre
    const filteredProducts = allProducts.filter((product: any) =>
      product.name.toLowerCase().includes(name.toLowerCase())
    );

    await handleProductSearchResponse(chatId, filteredProducts);
  } catch (error) {
    console.error("Error al buscar el producto:", error);
    bot.sendMessage(chatId, "Hubo un error al buscar el producto.");
  }
}

// Función para manejar la respuesta de la búsqueda de productos
async function handleProductSearchResponse(chatId, products) {
  if (products.length > 0) {
    for (const product of products) {
      const nombreProducto = product.name || "Nombre no disponible";
      let price;
      if (product.price === product.regular_price)
        price = `$${product.price}` || "Precio no disponible";
      else
        price =
          `<s>$${product.regular_price}</s> $${product.price}` ||
          "Precio no disponible";

      const urlProducto = product.permalink || "URL no disponible";

      if (product.stock_status === "instock") {
        await bot.sendMessage(
          chatId,
          `Nombre: <b>${nombreProducto}</b>\nPrecio: <i>${price}</i>\nURL: <a href="${urlProducto}">${urlProducto}</a>`,
          { parse_mode: "HTML" }
        );
      }
    }
  } else {
    await bot.sendMessage(
      chatId,
      "No se encontraron productos con esas características."
    );
  }

  // Este mensaje se enviará solo después de que todas las iteraciones hayan terminado
  await bot.sendMessage(chatId, "🔍¿Cómo te gustaría buscar?", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "⌨️ Buscar por nombre", callback_data: "search_by_name" }],
        [
          {
            text: "✅ Buscar por categoría",
            callback_data: "search_by_category",
          },
        ],
        [
          {
            text: "✍️ Buscar por categoría y nombre",
            callback_data: "search_by_category_and_name",
          },
        ],
      ],
    },
  });
}

// Función para buscar por categoría
async function searchByCategory(chatId, categoryId) {
    let allProducts: any[] = [];
    const perPage = 100; // Número máximo de productos por página
    let page = 1;
    let totalPages = 1; // Inicialmente se establece en 1 para entrar en el bucle
    
  try {
    while (page <= totalPages) {
        const response = await axios.get(
          `https://solutelcuba.com/wp-json/wc/v3/products`,
          {
            params: {
              per_page: perPage,
              page: page,
            },
            auth: {
              username: consumerKey,
              password: consumerSecret,
            },
          }
        );
  
        // Concatenar los productos obtenidos con los productos ya obtenidos
        allProducts = allProducts.concat(response.data);
  
        // Actualizar el total de páginas si es la primera solicitud
        if (page === 1) {
          totalPages = parseInt(response.headers['x-wp-totalpages'], 10) || 1;
        }
  
        // Incrementar el número de página para la siguiente solicitud
        page++;
    }

    // Filtrar productos que pertenezcan a la categoría especificada
    const filteredProducts = allProducts.filter((product: any) => {
      return product.categories.some((cat: any) => {
        const match = parseInt(cat.id) === parseInt(categoryId);
        return match;
      });
    });

    console.log("Productos filtrados antes de enviar: ",filteredProducts.length)
    await handleProductSearchResponse(chatId, filteredProducts);
  } catch (error) {
    console.error("Error al buscar el producto:", error);
    bot.sendMessage(chatId, "Hubo un error al buscar el producto.");
  }
}

async function listChildCategories(chatId: number, parentId: number) {
    let allCategories: any[] = [];
    const perPage = 100; // Número máximo de categorías por página
    let page = 1;
    let totalPages = 1; // Inicialmente se establece en 1 para entrar en el bucle
  
    try {
      while (page <= totalPages) {
        const response = await axios.get(
          `https://solutelcuba.com/wp-json/wc/v3/products/categories`,
          {
            params: {
              per_page: perPage,
              page: page,
              parent: parentId
            },
            auth: {
              username: consumerKey,
              password: consumerSecret,
            },
          }
        );
  
        // Concatenar las categorías obtenidas con las categorías ya obtenidas
        allCategories = allCategories.concat(response.data);
  
        // Actualizar el total de páginas si es la primera solicitud
        if (page === 1) {
          totalPages = parseInt(response.headers['x-wp-totalpages'], 10) || 1;
        }
  
        // Incrementar el número de página para la siguiente solicitud
        page++;
      }
    const subCategories = allCategories;

    // Filtrar productos que pertenezcan a la categoría especificada
    const filtereCategorys = subCategories.filter(
      (category: any) => category.count > 0
    );

    // Verifica que las subcategorías se estén obteniendo correctamente
    if (!filtereCategorys || filtereCategorys.length === 0) {
      await searchByCategory(chatId, parentId);
      return;
    }

    // Mapear las subcategorías para construir los botones inline
    const subCategoryButtons: Array<{ text: string; callback_data: string }> =
      filtereCategorys.map((cat) => ({
        text: cat.name,
        callback_data: `subcategory_${cat.id}`,
      }));

    // Declarar el teclado como un array de arrays de botones
    const keyboard: Array<Array<{ text: string; callback_data: string }>> = [];

    // Agrupar los botones en filas de 2
    for (let i = 0; i < subCategoryButtons.length; i += 2) {
      keyboard.push(subCategoryButtons.slice(i, i + 2));
    }

    bot.sendMessage(chatId, "Selecciona una subcategoría:", {
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  } catch (error) {
    console.error("Error al obtener las subcategorías:", error);
    bot.sendMessage(chatId, "Hubo un error al obtener las subcategorías.");
  }
}
