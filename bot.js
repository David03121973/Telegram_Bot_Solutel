var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var TelegramBot = require("node-telegram-bot-api");
var axios = require("axios");
var getUniqueCategories = require("./auxFuntionProps").getUniqueCategories;
var cheerio = require("cheerio");
var token = "7074935867:AAFViPFwOxHa_wPc3cuGF1AWeFk2NC52GHc";
var bot = new TelegramBot(token, { polling: true });
var consumerKey = "ck_aaae303d49b4ac57c713472aca2f610d4c99e195";
var consumerSecret = "cs_646f2fd371adc5d405a5a7bb9a464909e94a0c75";
var currentSearchOption = ""; // Para rastrear la opción de búsqueda seleccionada
var selectedCategory = null; // Para almacenar la categoría seleccionada
// Manejar el comando /start
bot.onText(/\/start/, function (msg) {
    var chatId = msg.chat.id;
    bot.sendMessage(chatId, "\uD83D\uDCBB\uD83D\uDCF1<b>Bienvenidos a nuestra tienda online</b>\uD83D\uDCBE\u231A\uFE0F", { parse_mode: "HTML" });
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
bot.on("callback_query", function (query) { return __awaiter(_this, void 0, void 0, function () {
    var chatId, option;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                chatId = query.message.chat.id;
                option = query.data;
                if (!(option === "search_by_name")) return [3 /*break*/, 1];
                currentSearchOption = "name";
                bot.sendMessage(chatId, "Por favor, ingresa el nombre del producto:");
                return [3 /*break*/, 5];
            case 1:
                if (!(option === "search_by_category")) return [3 /*break*/, 3];
                currentSearchOption = "category";
                return [4 /*yield*/, listCategories(chatId)];
            case 2:
                _a.sent();
                return [3 /*break*/, 5];
            case 3:
                if (!(option === "search_by_category_and_name")) return [3 /*break*/, 5];
                currentSearchOption = "category_and_name";
                return [4 /*yield*/, listCategories(chatId)];
            case 4:
                _a.sent();
                _a.label = 5;
            case 5: return [2 /*return*/];
        }
    });
}); });
// Manejar el mensaje del usuario para las búsquedas
bot.on("message", function (msg) { return __awaiter(_this, void 0, void 0, function () {
    var chatId, text;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                chatId = msg.chat.id;
                text = msg.text;
                // Evitar que se ejecute la búsqueda cuando el usuario envía comandos como /start
                if (text.startsWith("/"))
                    return [2 /*return*/];
                if (!(currentSearchOption === "name")) return [3 /*break*/, 2];
                return [4 /*yield*/, searchByName(chatId, text)];
            case 1:
                _a.sent();
                return [3 /*break*/, 5];
            case 2:
                if (!(currentSearchOption === "category_and_name" && selectedCategory)) return [3 /*break*/, 4];
                return [4 /*yield*/, searchByCategoryAndName(chatId, selectedCategory, text)];
            case 3:
                _a.sent();
                return [3 /*break*/, 5];
            case 4:
                bot.sendMessage(chatId, "Por favor, selecciona una opción de búsqueda primero.");
                _a.label = 5;
            case 5: return [2 /*return*/];
        }
    });
}); });
// Función para listar las categorías principales
function listCategories(chatId) {
    return __awaiter(this, void 0, void 0, function () {
        var categories, categoryNameMap_1, categoryButtons, keyboard, i, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, getUniqueCategories()];
                case 1:
                    categories = _a.sent();
                    // Verifica que las categorías se estén obteniendo correctamente
                    if (!categories || categories.length === 0) {
                        bot.sendMessage(chatId, "No se encontraron categorías.");
                        return [2 /*return*/];
                    }
                    categoryNameMap_1 = {
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
                    categoryButtons = categories.map(function (cat) { return ({
                        text: categoryNameMap_1[cat.name] || cat.name,
                        callback_data: "category_".concat(cat.id),
                    }); });
                    keyboard = [];
                    // Agrupar los botones en filas de 2
                    for (i = 0; i < categoryButtons.length; i += 2) {
                        keyboard.push(categoryButtons.slice(i, i + 2));
                    }
                    bot.sendMessage(chatId, "☑️ Selecciona una categoría:", {
                        reply_markup: {
                            inline_keyboard: keyboard,
                        },
                    });
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error("Error al obtener las categorías:", error_1);
                    bot.sendMessage(chatId, "Hubo un error al obtener las categorías.");
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
bot.on("callback_query", function (query) { return __awaiter(_this, void 0, void 0, function () {
    var chatId, data, categoryId, selectedSubCategoryId;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                chatId = query.message.chat.id;
                data = query.data;
                if (!data.startsWith("category_")) return [3 /*break*/, 8];
                selectedCategory = data.split("_")[1];
                if (!(currentSearchOption === "category")) return [3 /*break*/, 6];
                if (!selectedCategory) return [3 /*break*/, 4];
                categoryId = parseInt(selectedCategory);
                if (!!isNaN(categoryId)) return [3 /*break*/, 2];
                return [4 /*yield*/, listChildCategories(chatId, categoryId)];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                bot.sendMessage(chatId, "ID de categoría inválido.");
                _a.label = 3;
            case 3: return [3 /*break*/, 5];
            case 4:
                bot.sendMessage(chatId, "No se ha seleccionado ninguna categoría.");
                _a.label = 5;
            case 5: return [3 /*break*/, 7];
            case 6:
                if (currentSearchOption === "category_and_name") {
                    bot.sendMessage(chatId, "Por favor, ingresa el nombre del producto:");
                }
                _a.label = 7;
            case 7: return [3 /*break*/, 11];
            case 8:
                if (!data.startsWith("subcategory_")) return [3 /*break*/, 11];
                selectedSubCategoryId = data.split("_")[1];
                if (!(currentSearchOption === "category")) return [3 /*break*/, 10];
                // Buscar productos en la subcategoría seleccionada
                return [4 /*yield*/, searchByCategory(chatId, selectedSubCategoryId)];
            case 9:
                // Buscar productos en la subcategoría seleccionada
                _a.sent();
                return [3 /*break*/, 11];
            case 10:
                if (currentSearchOption === "category_and_name") {
                    bot.sendMessage(chatId, "Por favor, ingresa el nombre del producto:");
                }
                _a.label = 11;
            case 11: return [2 /*return*/];
        }
    });
}); });
// Función para buscar por nombre
function searchByName(chatId, name) {
    return __awaiter(this, void 0, void 0, function () {
        var allProducts, perPage, page, totalPages, response, filteredProducts, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    allProducts = [];
                    perPage = 100;
                    page = 1;
                    totalPages = 1;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    _a.label = 2;
                case 2:
                    if (!(page <= totalPages)) return [3 /*break*/, 4];
                    return [4 /*yield*/, axios.get("https://solutelcuba.com/wp-json/wc/v3/products", {
                            params: {
                                per_page: perPage,
                                page: page,
                                search: name
                            },
                            auth: {
                                username: consumerKey,
                                password: consumerSecret,
                            },
                        })];
                case 3:
                    response = _a.sent();
                    // Concatenar los productos obtenidos con los productos ya obtenidos
                    allProducts = allProducts.concat(response.data);
                    // Actualizar el total de páginas si es la primera solicitud
                    if (page === 1) {
                        totalPages = parseInt(response.headers['x-wp-totalpages'], 10) || 1;
                    }
                    // Incrementar el número de página para la siguiente solicitud
                    page++;
                    return [3 /*break*/, 2];
                case 4:
                    filteredProducts = allProducts.filter(function (product) {
                        return product.name.toLowerCase().includes(name.toLowerCase());
                    });
                    // Manejar la respuesta de búsqueda de productos
                    return [4 /*yield*/, handleProductSearchResponse(chatId, filteredProducts)];
                case 5:
                    // Manejar la respuesta de búsqueda de productos
                    _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    error_2 = _a.sent();
                    console.error("Error al buscar el producto:", error_2);
                    bot.sendMessage(chatId, "Hubo un error al buscar el producto.");
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
// Función para buscar por categoría y nombre
function searchByCategoryAndName(chatId, categoryId, name) {
    return __awaiter(this, void 0, void 0, function () {
        var allProducts, perPage, page, totalPages, response, filteredProducts, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    allProducts = [];
                    perPage = 100;
                    page = 1;
                    totalPages = 1;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    _a.label = 2;
                case 2:
                    if (!(page <= totalPages)) return [3 /*break*/, 4];
                    return [4 /*yield*/, axios.get("https://solutelcuba.com/wp-json/wc/v3/products", {
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
                        })];
                case 3:
                    response = _a.sent();
                    // Concatenar los productos obtenidos con los productos ya obtenidos
                    allProducts = allProducts.concat(response.data);
                    // Actualizar el total de páginas si es la primera solicitud
                    if (page === 1) {
                        totalPages = parseInt(response.headers['x-wp-totalpages'], 10) || 1;
                    }
                    // Incrementar el número de página para la siguiente solicitud
                    page++;
                    return [3 /*break*/, 2];
                case 4:
                    filteredProducts = allProducts.filter(function (product) {
                        return product.name.toLowerCase().includes(name.toLowerCase());
                    });
                    return [4 /*yield*/, handleProductSearchResponse(chatId, filteredProducts)];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    error_3 = _a.sent();
                    console.error("Error al buscar el producto:", error_3);
                    bot.sendMessage(chatId, "Hubo un error al buscar el producto.");
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
// Función para manejar la respuesta de la búsqueda de productos
function handleProductSearchResponse(chatId, products) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, products_1, product, nombreProducto, price, urlProducto;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(products.length > 0)) return [3 /*break*/, 5];
                    _i = 0, products_1 = products;
                    _a.label = 1;
                case 1:
                    if (!(_i < products_1.length)) return [3 /*break*/, 4];
                    product = products_1[_i];
                    nombreProducto = product.name || "Nombre no disponible";
                    price = void 0;
                    if (product.price === product.regular_price)
                        price = "$".concat(product.price) || "Precio no disponible";
                    else
                        price =
                            "<s>$".concat(product.regular_price, "</s> $").concat(product.price) ||
                                "Precio no disponible";
                    urlProducto = product.permalink || "URL no disponible";
                    if (!(product.stock_status === "instock")) return [3 /*break*/, 3];
                    return [4 /*yield*/, bot.sendMessage(chatId, "Nombre: <b>".concat(nombreProducto, "</b>\nPrecio: <i>").concat(price, "</i>\nURL: <a href=\"").concat(urlProducto, "\">").concat(urlProducto, "</a>"), { parse_mode: "HTML" })];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [3 /*break*/, 7];
                case 5: return [4 /*yield*/, bot.sendMessage(chatId, "No se encontraron productos con esas características.")];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7: 
                // Este mensaje se enviará solo después de que todas las iteraciones hayan terminado
                return [4 /*yield*/, bot.sendMessage(chatId, "🔍¿Cómo te gustaría buscar?", {
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
                    })];
                case 8:
                    // Este mensaje se enviará solo después de que todas las iteraciones hayan terminado
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// Función para buscar por categoría
function searchByCategory(chatId, categoryId) {
    return __awaiter(this, void 0, void 0, function () {
        var allProducts, perPage, page, totalPages, response, filteredProducts, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    allProducts = [];
                    perPage = 100;
                    page = 1;
                    totalPages = 1;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    _a.label = 2;
                case 2:
                    if (!(page <= totalPages)) return [3 /*break*/, 4];
                    return [4 /*yield*/, axios.get("https://solutelcuba.com/wp-json/wc/v3/products", {
                            params: {
                                per_page: perPage,
                                page: page,
                            },
                            auth: {
                                username: consumerKey,
                                password: consumerSecret,
                            },
                        })];
                case 3:
                    response = _a.sent();
                    // Concatenar los productos obtenidos con los productos ya obtenidos
                    allProducts = allProducts.concat(response.data);
                    // Actualizar el total de páginas si es la primera solicitud
                    if (page === 1) {
                        totalPages = parseInt(response.headers['x-wp-totalpages'], 10) || 1;
                    }
                    // Incrementar el número de página para la siguiente solicitud
                    page++;
                    return [3 /*break*/, 2];
                case 4:
                    filteredProducts = allProducts.filter(function (product) {
                        return product.categories.some(function (cat) {
                            var match = parseInt(cat.id) === parseInt(categoryId);
                            return match;
                        });
                    });
                    console.log("Productos filtrados antes de enviar: ", filteredProducts.length);
                    return [4 /*yield*/, handleProductSearchResponse(chatId, filteredProducts)];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    error_4 = _a.sent();
                    console.error("Error al buscar el producto:", error_4);
                    bot.sendMessage(chatId, "Hubo un error al buscar el producto.");
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function listChildCategories(chatId, parentId) {
    return __awaiter(this, void 0, void 0, function () {
        var allCategories, perPage, page, totalPages, response, subCategories, filtereCategorys, subCategoryButtons, keyboard, i, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    allCategories = [];
                    perPage = 100;
                    page = 1;
                    totalPages = 1;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    _a.label = 2;
                case 2:
                    if (!(page <= totalPages)) return [3 /*break*/, 4];
                    return [4 /*yield*/, axios.get("https://solutelcuba.com/wp-json/wc/v3/products/categories", {
                            params: {
                                per_page: perPage,
                                page: page,
                                parent: parentId
                            },
                            auth: {
                                username: consumerKey,
                                password: consumerSecret,
                            },
                        })];
                case 3:
                    response = _a.sent();
                    // Concatenar las categorías obtenidas con las categorías ya obtenidas
                    allCategories = allCategories.concat(response.data);
                    // Actualizar el total de páginas si es la primera solicitud
                    if (page === 1) {
                        totalPages = parseInt(response.headers['x-wp-totalpages'], 10) || 1;
                    }
                    // Incrementar el número de página para la siguiente solicitud
                    page++;
                    return [3 /*break*/, 2];
                case 4:
                    subCategories = allCategories;
                    filtereCategorys = subCategories.filter(function (category) { return category.count > 0; });
                    if (!(!filtereCategorys || filtereCategorys.length === 0)) return [3 /*break*/, 6];
                    return [4 /*yield*/, searchByCategory(chatId, parentId)];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
                case 6:
                    subCategoryButtons = filtereCategorys.map(function (cat) { return ({
                        text: cat.name,
                        callback_data: "subcategory_".concat(cat.id),
                    }); });
                    keyboard = [];
                    // Agrupar los botones en filas de 2
                    for (i = 0; i < subCategoryButtons.length; i += 2) {
                        keyboard.push(subCategoryButtons.slice(i, i + 2));
                    }
                    bot.sendMessage(chatId, "Selecciona una subcategoría:", {
                        reply_markup: {
                            inline_keyboard: keyboard,
                        },
                    });
                    return [3 /*break*/, 8];
                case 7:
                    error_5 = _a.sent();
                    console.error("Error al obtener las subcategorías:", error_5);
                    bot.sendMessage(chatId, "Hubo un error al obtener las subcategorías.");
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
