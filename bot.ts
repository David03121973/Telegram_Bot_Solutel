const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const { getUniqueCategories } = require("./auxFuntionProps");
const cheerio = require("cheerio");
const fs = require("fs");
import { getPrecio } from "./PrecioCambio";

const token = "7074935867:AAFViPFwOxHa_wPc3cuGF1AWeFk2NC52GHc";
const bot = new TelegramBot(token, { polling: true });

const consumerKey = "ck_aaae303d49b4ac57c713472aca2f610d4c99e195";
const consumerSecret = "cs_646f2fd371adc5d405a5a7bb9a464909e94a0c75";

let currentSearchOption = ""; // Para rastrear la opción de búsqueda seleccionada
let selectedCategory = null; // Para almacenar la categoría seleccionada

// Función para guardar el ID del usuario en un archivo
function logUserId_UsoElBot(chatId) {
  fs.appendFile("user_ids_UsoElBot.txt", `${chatId}\n`, (err) => {
    if (err) 
      console.error("Error al guardar el ID del usuario:", err);
  });
}

// Manejar el comando /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `💻📱<b>TIENDA SOLUTEL</b>💾⌚️`, { parse_mode: "HTML" });
  bot.sendMessage(chatId, "🔍¿Cómo te gustaría buscar?", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "⌨️ Buscar por nombre", callback_data: "search_by_name" }],
        [{ text: "✅ Buscar por categoría", callback_data: "search_by_category" }],
        [{ text: "✍️ Buscar por categoría y nombre", callback_data: "search_by_category_and_name" }],
      ],
    },
  });

  // Guardar el ID del usuario cuando se inicia el bot
  logUserId_UsoElBot(chatId);
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
    bot.sendMessage(chatId, "Por favor, selecciona una opción de búsqueda primero.");
  }
});


// Función para listar las categorías principales
async function listCategories(chatId: number) {
  try {
    const categories = await getUniqueCategories();

    if (!categories || categories.length === 0) {
      bot.sendMessage(chatId, "No se encontraron categorías.");
      return;
    }

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

    const categoryButtons: Array<{ text: string; callback_data: string }> =
      categories.map((cat) => ({
        text: categoryNameMap[cat.name] || cat.name,
        callback_data: `category_${cat.id}`,
      }));

    const keyboard: Array<Array<{ text: string; callback_data: string }>> = [];

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

// Modificación aquí: Eliminar la lógica de subcategorías
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data.startsWith("category_")) {
    selectedCategory = data.split("_")[1];

    if (currentSearchOption === "category") {
      if (selectedCategory) {
        const categoryId = parseInt(selectedCategory);
        if (!isNaN(categoryId)) {
          // Buscar productos en la categoría seleccionada, sin importar subcategorías
          await searchByCategory(chatId, categoryId);
        } else {
          bot.sendMessage(chatId, "ID de categoría inválido.");
        }
      } else {
        bot.sendMessage(chatId, "No se ha seleccionado ninguna categoría.");
      }
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
      removeAccents(product.name.toLowerCase()).includes(removeAccents(name.toLowerCase()))
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
      removeAccents(product.name.toLowerCase()).includes(removeAccents(name.toLowerCase()))
    );

      // Filtrar productos que pertenezcan a la categoría especificada
  const filteredProducts_2 = filteredProducts.filter((product: any) => {
    return product.categories.some((cat: any) => {
      const match = parseInt(cat.id) === parseInt(categoryId);
      return match;
    });
  });

    await handleProductSearchResponse(chatId, filteredProducts_2);
  } catch (error) {
    console.error("Error al buscar el producto:", error);
    bot.sendMessage(chatId, "Hubo un error al buscar el producto.");
  }
}

// Función para manejar la respuesta de la búsqueda de productos
async function handleProductSearchResponse(chatId, products) {
  const precioCambio = getPrecio();
  if (products.length > 0) {
    for (const product of products) {
      const nombreProducto = product.name || "Nombre no disponible";
      let price;
      if (product.price === product.regular_price)
        price = `Precio: <b>$${product.price * precioCambio}</b>` || "Precio no disponible";
      else
        price =
          `<b>🚨 OFERTA ESPECIAL 🚨</b>: <s>$${product.regular_price * precioCambio}</s> <b>$${product.price * precioCambio}</b>` ||
          "Precio no disponible";

      const urlProducto = product.permalink || "URL no disponible";

      if (product.stock_status === "instock") {
        await bot.sendMessage(
          chatId,
          `Nombre: <b>${nombreProducto}</b>\n<i>${price}</i>\nURL: <a href="${urlProducto}">${urlProducto}</a>`,
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

  await handleProductSearchResponse(chatId, filteredProducts);
} catch (error) {
  console.error("Error al buscar el producto:", error);
  bot.sendMessage(chatId, "Hubo un error al buscar el producto.");
}
}

// Función para eliminar tildes de una cadena
function removeAccents(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}