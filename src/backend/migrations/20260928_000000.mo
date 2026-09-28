import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";

module {
  // ---- Inlined old state shape (previous deployed version) ----
  // Fresh install: the deployed baseline is an empty actor, so the chain
  // starts from {} and this single migration supplies every stable field.
  public type OldActor = {};

  // ---- Inlined new state shape ----
  public type ProductInternal = {
    id : Nat;
    categoryId : Nat;
    name : Text;
    brand : Text;
    packSize : Text;
    imageUrl : Text;
    originalPrice : Nat;
    discountPrice : Nat;
    stockQuantity : Nat;
    description : Text;
    createdAt : Int;
  };

  public type CategoryInternal = {
    id : Nat;
    name : Text;
    imageUrl : Text;
  };

  public type CouponInternal = {
    id : Nat;
    code : Text;
    description : Text;
    discountPercent : Nat;
    minOrderValue : Nat;
    maxDiscount : Nat;
    active : Bool;
  };

  public type CatalogState = {
    var nextProductId : Nat;
    var nextCategoryId : Nat;
    var nextCouponId : Nat;
  };

  public type CartLine = {
    productId : Nat;
    quantity : Nat;
  };

  public type OrderLine = {
    productId : Nat;
    name : Text;
    brand : Text;
    packSize : Text;
    imageUrl : Text;
    unitPrice : Nat;
    originalUnitPrice : Nat;
    quantity : Nat;
    lineTotal : Nat;
  };

  public type Address = {
    fullName : Text;
    mobile : Text;
    houseFlat : Text;
    area : Text;
    pincode : Text;
    landmark : Text;
    instructions : Text;
  };

  public type PaymentMethod = { #cod; #online };

  public type OrderStatus = {
    #placed;
    #confirmed;
    #packing;
    #outForDelivery;
    #delivered;
  };

  public type OrderInternal = {
    id : Nat;
    lines : [OrderLine];
    subtotal : Nat;
    discountTotal : Nat;
    deliveryCharge : Nat;
    couponCode : ?Text;
    couponDiscount : Nat;
    total : Nat;
    address : Address;
    paymentMethod : PaymentMethod;
    status : OrderStatus;
    placedAt : Int;
    updatedAt : Int;
  };

  public type CartState = { var nextOrderId : Nat };

  public type UserProfile = { name : Text; email : ?Text };

  public type SavedAddress = { id : Nat; address : Address };

  public type NotificationInternal = {
    id : Nat;
    title : Text;
    body : Text;
    createdAt : Int;
    read : Bool;
  };

  public type AccountState = {
    var nextAddressId : Nat;
    var nextNotificationId : Nat;
  };

  public type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    products : Map.Map<Nat, ProductInternal>;
    categories : Map.Map<Nat, CategoryInternal>;
    coupons : Map.Map<Nat, CouponInternal>;
    catalogState : CatalogState;
    carts : Map.Map<Principal, List.List<CartLine>>;
    cartCoupons : Map.Map<Principal, Text>;
    orders : Map.Map<Principal, List.List<OrderInternal>>;
    cartState : CartState;
    profiles : Map.Map<Principal, UserProfile>;
    emails : Map.Map<Principal, Text>;
    addresses : Map.Map<Principal, List.List<SavedAddress>>;
    wishlists : Map.Map<Principal, List.List<Nat>>;
    recentlyViewed : Map.Map<Principal, List.List<Nat>>;
    notifications : Map.Map<Principal, List.List<NotificationInternal>>;
    accountState : AccountState;
  };

  // ---- Seed data (inlined; migrations may not import project modules) ----

  let categorySeeds : [(Text, Text)] = [
    ("Rice", "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400"),
    ("Atta & Flour", "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400"),
    ("Dal & Pulses", "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400"),
    ("Salt & Sugar", "https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=400"),
    ("Cooking Oil & Ghee", "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400"),
    ("Biscuits", "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400"),
    ("Kurkure & Chips", "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400"),
    ("Namkeen", "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400"),
    ("Snacks", "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400"),
    ("Dry Fruits", "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400"),
    ("Tea & Coffee", "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400"),
    ("Spices & Masala", "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400"),
    ("Noodles & Pasta", "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400"),
    ("Sauces & Ketchup", "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=400"),
    ("Breakfast Items", "https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=400"),
    ("Dairy Products", "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400"),
    ("Personal Care", "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400"),
    ("Face Wash", "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400"),
    ("Cream & Moisturizer", "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400"),
    ("Shampoo & Hair Care", "https://images.unsplash.com/photo-1585232004423-244e0e6904e3?w=400"),
    ("Soap & Body Care", "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400"),
    ("Toothpaste & Oral Care", "https://images.unsplash.com/photo-1559591937-abc3a5b1f4c1?w=400"),
    ("Home Cleaning", "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400"),
    ("Harpic & Toilet Cleaner", "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400"),
    ("Dishwash & Kitchen Cleaning", "https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=400"),
    ("Detergent & Laundry", "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400"),
    ("Other Daily Grocery Essentials", "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400"),
  ];

  // (categoryId, name, brand, packSize, imageUrl, originalPrice, discountPrice, stock, description)
  let productSeeds : [(Nat, Text, Text, Text, Text, Nat, Nat, Nat, Text)] = [
    (1, "India Gate Basmati Rice", "India Gate", "5 kg", "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600", 74900, 59900, 120, "Premium aged long-grain Basmati rice, perfect for biryani and pulao."),
    (1, "Sona Masoori Rice", "Daawat", "5 kg", "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=600", 49900, 42900, 90, "Light and aromatic Sona Masoori rice, ideal for everyday meals."),
    (1, "Kolam Rice", "Fortune", "5 kg", "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600", 44900, 38900, 75, "Soft-cooking Kolam rice suited to South Indian daily cooking."),
    (1, "Brown Basmati Rice", "Organic India", "1 kg", "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600", 19900, 16900, 60, "Whole-grain brown Basmati rice with a nutty flavour and high fibre."),
    (1, "Ponni Boiled Rice", "Idhayam", "5 kg", "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600", 39900, 34900, 80, "Parboiled Ponni rice, a staple for South Indian meals."),
    (1, "Jeera Samba Rice", "GRB", "1 kg", "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=600", 14900, 12900, 55, "Short-grain jeera samba rice with a distinctive aroma."),
    (1, "Poha (Flattened Rice)", "24 Mantra", "500 g", "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600", 6900, 5900, 100, "Thin flattened rice, ready for poha and chivda."),
    (1, "Idli Rice", "Lal Qilla", "5 kg", "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600", 42900, 37900, 70, "Parboiled idli rice for soft, fluffy idlis and dosas."),
    (2, "Aashirvaad Whole Wheat Atta", "Aashirvaad", "5 kg", "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600", 32900, 27900, 150, "100% whole wheat chakki atta for soft rotis and phulka."),
    (2, "Pillsbury Multigrain Atta", "Pillsbury", "5 kg", "https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=600", 39900, 34900, 85, "Multigrain atta with oats, soya and flaxseed for extra nutrition."),
    (2, "Bansi Wheat Flour", "Lal Qilla", "5 kg", "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600", 29900, 25900, 65, "Fine-milled bansi wheat flour for chapatis and parathas."),
    (2, "Besan (Gram Flour)", "Rajdhani", "1 kg", "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600", 9900, 8400, 110, "Stone-ground gram flour for pakoras, besan chilla and sweets."),
    (2, "Maida (Refined Flour)", "Fortune", "1 kg", "https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=600", 6900, 5900, 95, "Fine refined flour for baking, naan and pastries."),
    (2, "Ragi Flour", "24 Mantra", "1 kg", "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600", 8900, 7500, 60, "Calcium-rich finger millet flour for ragi mudde and dosa."),
    (2, "Suji (Semolina)", "Bansi", "1 kg", "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600", 5900, 4900, 120, "Coarse semolina for upma, halwa and rava dosa."),
    (2, "Corn Flour", "Weikfield", "500 g", "https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=600", 5900, 4900, 80, "Fine corn flour for thickening gravies and crispy frying."),
    (3, "Toor Dal (Arhar)", "Tata Sampann", "1 kg", "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600", 18900, 15900, 140, "Unpolished toor dal, high in protein for everyday dal."),
    (3, "Moong Dal (Yellow)", "Rajdhani", "1 kg", "https://images.unsplash.com/photo-1585996985284-4a0e7c8b0f1a?w=600", 16900, 13900, 130, "Split yellow moong dal, quick-cooking and easy to digest."),
    (3, "Chana Dal", "Tata Sampann", "1 kg", "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600", 14900, 12400, 115, "Bengal gram split dal for dal fry and sambar."),
    (3, "Masoor Dal (Red Lentil)", "Fortune", "1 kg", "https://images.unsplash.com/photo-1585996985284-4a0e7c8b0f1a?w=600", 13900, 11400, 125, "Red lentils that cook fast into a creamy dal."),
    (3, "Kabuli Chana", "Rajdhani", "1 kg", "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600", 17900, 14900, 90, "Large white chickpeas for chole and salads."),
    (3, "Rajma (Kidney Beans)", "Tata Sampann", "1 kg", "https://images.unsplash.com/photo-1585996985284-4a0e7c8b0f1a?w=600", 19900, 16900, 85, "Red kidney beans for rich rajma masala."),
    (3, "Urad Dal (Whole)", "Lal Qilla", "1 kg", "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600", 18900, 15900, 70, "Whole black gram for dal makhani and idli batter."),
    (3, "Kala Chana", "24 Mantra", "1 kg", "https://images.unsplash.com/photo-1585996985284-4a0e7c8b0f1a?w=600", 12900, 10900, 75, "Brown chickpeas for kala chana curry and chaat."),
    (4, "Tata Salt Iodised", "Tata", "1 kg", "https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=600", 2800, 2500, 300, "India's trusted iodised table salt."),
    (4, "Rock Salt (Sendha Namak)", "Catch", "1 kg", "https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=600", 4900, 4200, 90, "Natural rock salt for fasting and everyday cooking."),
    (4, "Sugar (Refined)", "Madhur", "1 kg", "https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=600", 5500, 4900, 200, "Fine white refined sugar for tea, coffee and desserts."),
    (4, "Jaggery Block", "Organic India", "500 g", "https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=600", 6900, 5900, 80, "Chemical-free jaggery block, a natural sweetener."),
    (4, "Powdered Sugar", "Weikfield", "500 g", "https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=600", 7900, 6900, 60, "Finely powdered sugar for baking and icing."),
    (4, "Black Salt (Kala Namak)", "Catch", "200 g", "https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=600", 3900, 3300, 100, "Pungent black salt for chaat and raita."),
    (4, "Himalayan Pink Salt", "Catch", "1 kg", "https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=600", 9900, 8400, 70, "Mineral-rich pink salt crystals from the Himalayas."),
    (4, "Sugar Free Natura", "Sugar Free", "500 g", "https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=600", 24900, 21900, 40, "Low-calorie sugar substitute for tea and coffee."),
    (5, "Fortune Sunflower Oil", "Fortune", "1 L", "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600", 16900, 14900, 180, "Light and healthy refined sunflower oil for daily cooking."),
    (5, "Saffola Gold Oil", "Saffola", "1 L", "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600", 19900, 17400, 120, "Blend of rice bran and sunflower oil for heart health."),
    (5, "Amul Pure Ghee", "Amul", "1 L", "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=600", 64900, 59900, 100, "Rich, aromatic pure cow ghee in a tin."),
    (5, "Mustard Oil", "Fortune", "1 L", "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600", 17900, 15400, 95, "Pungent kachi ghani mustard oil for authentic Indian cooking."),
    (5, "Groundnut Oil", "Dhara", "1 L", "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600", 21900, 19400, 80, "Cold-pressed groundnut oil with a rich nutty taste."),
    (5, "Coconut Oil", "Parachute", "500 ml", "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600", 19900, 17400, 110, "Pure coconut oil for cooking and hair care."),
    (5, "Olive Oil (Extra Virgin)", "Borges", "500 ml", "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600", 59900, 49900, 45, "Cold-extracted extra virgin olive oil for salads and cooking."),
    (5, "Rice Bran Oil", "Fortune", "1 L", "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600", 18900, 16400, 85, "Light rice bran oil with a high smoke point."),
    (6, "Parle-G Gold Biscuits", "Parle", "1 kg", "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600", 12900, 10900, 200, "Classic glucose biscuits, a perfect tea-time companion."),
    (6, "Britannia Good Day Cashew", "Britannia", "600 g", "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600", 9900, 8400, 150, "Buttery cookies loaded with cashew pieces."),
    (6, "Oreo Chocolate Creme", "Oreo", "300 g", "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600", 6900, 5900, 130, "Chocolate sandwich biscuits with a creamy centre."),
    (6, "Bourbon Chocolate Cream", "Britannia", "400 g", "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600", 5900, 4900, 140, "Chocolate cream biscuits with a crunchy cocoa shell."),
    (6, "Marie Gold Biscuits", "Britannia", "800 g", "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600", 8900, 7500, 160, "Light and crisp Marie biscuits, low in sugar."),
    (6, "Hide & Seek Choco Chip", "Parle", "400 g", "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600", 7900, 6900, 120, "Chocolate chip cookies with a rich cocoa taste."),
    (6, "NutriChoice Digestive", "Britannia", "1 kg", "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600", 15900, 13900, 90, "High-fibre digestive biscuits with wheat and oats."),
    (6, "Kaju Pista Cookies", "Unibic", "500 g", "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600", 14900, 12900, 70, "Premium cookies with cashew and pistachio."),
    (7, "Kurkure Masala Munch", "Kurkure", "180 g", "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600", 4900, 4200, 220, "Crunchy masala-flavoured corn puffs."),
    (7, "Lay's Classic Salted Chips", "Lay's", "52 g", "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600", 2000, 1800, 300, "Thin and crispy classic salted potato chips."),
    (7, "Lay's Magic Masala", "Lay's", "52 g", "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600", 2000, 1800, 280, "Potato chips with a spicy Indian masala twist."),
    (7, "Bingo Mad Angles", "Bingo", "130 g", "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600", 4900, 4200, 180, "Tangy tomato-flavoured triangle corn chips."),
    (7, "Kurkure Chilli Chatka", "Kurkure", "180 g", "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600", 4900, 4200, 190, "Spicy chilli-flavoured crunchy snack."),
    (7, "Pringles Original", "Pringles", "107 g", "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600", 19900, 17900, 60, "Stackable saddle-shaped potato crisps."),
    (7, "Too Yumm Multigrain Chips", "Too Yumm", "54 g", "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600", 4000, 3400, 100, "Baked multigrain chips, a lighter snack option."),
    (7, "Uncle Chipps Spicy Treat", "Uncle Chipps", "55 g", "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600", 2000, 1800, 150, "Spicy potato wafers with a tangy masala coating."),
    (8, "Haldiram's Aloo Bhujia", "Haldiram's", "400 g", "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600", 9900, 8400, 170, "Crispy potato bhujia with a spicy kick."),
    (8, "Haldiram's Moong Dal", "Haldiram's", "400 g", "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600", 9900, 8400, 150, "Salted fried moong dal, a classic namkeen."),
    (8, "Bikaji Bikaneri Bhujia", "Bikaji", "400 g", "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600", 10900, 9400, 130, "Authentic Bikaneri bhujia, crisp and flavourful."),
    (8, "Haldiram's Khatta Meetha", "Haldiram's", "400 g", "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600", 9900, 8400, 120, "Sweet and tangy mixture of sev and boondi."),
    (8, "Navratan Mixture", "Bikaji", "400 g", "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600", 10900, 9400, 110, "Nine-ingredient savoury mixture with peanuts and sev."),
    (8, "Roasted Chana", "24 Mantra", "500 g", "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600", 8900, 7500, 100, "Protein-rich roasted brown chana, a healthy snack."),
    (8, "Masala Peanuts", "Haldiram's", "200 g", "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600", 5900, 4900, 140, "Spiced and fried peanuts with a crunchy coating."),
    (8, "Sev Murmura", "Bikaji", "400 g", "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600", 8900, 7500, 95, "Light puffed rice mixed with fine sev."),
    (9, "Maggi Hot & Sweet Sauce", "Maggi", "500 g", "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600", 9900, 8900, 90, "Sweet and spicy tomato chilli sauce."),
    (9, "Act II Popcorn Butter", "Act II", "70 g", "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600", 4000, 3400, 160, "Instant butter-flavoured microwave popcorn."),
    (9, "Peanut Chikki", "Haldiram's", "200 g", "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600", 5900, 4900, 120, "Crunchy jaggery and peanut brittle."),
    (9, "Instant Noodles Masala", "Maggi", "560 g", "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600", 9900, 8900, 200, "Classic masala instant noodles, pack of 8."),
    (9, "Granola Bar Choco", "Yoga Bar", "240 g", "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600", 24900, 21900, 60, "Chocolate granola bars with oats and nuts."),
    (9, "Salted Cashews", "Happilo", "200 g", "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600", 29900, 25900, 70, "Premium roasted and salted cashew nuts."),
    (9, "Fruit & Nut Mix", "Happilo", "200 g", "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600", 27900, 23900, 65, "Trail mix of almonds, cashews, raisins and cranberries."),
    (9, "Rusk Toast", "Britannia", "300 g", "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600", 5900, 4900, 130, "Crisp double-baked rusk, ideal with tea."),
    (10, "Almonds (Badam)", "Happilo", "500 g", "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600", 59900, 49900, 90, "Premium California almonds, rich in vitamin E."),
    (10, "Cashews (Kaju)", "Happilo", "500 g", "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600", 64900, 54900, 80, "Whole W240 cashews with a creamy texture."),
    (10, "Pistachios (Pista)", "Happilo", "250 g", "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600", 44900, 37900, 60, "Roasted and salted Iranian pistachios."),
    (10, "Walnuts (Akhrot)", "Happilo", "250 g", "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600", 39900, 33900, 55, "Shelled walnut kernels, a rich source of omega-3."),
    (10, "Raisins (Kishmish)", "Happilo", "500 g", "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600", 19900, 16900, 100, "Sweet golden raisins, naturally sun-dried."),
    (10, "Dates (Khajur)", "Lion", "500 g", "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600", 24900, 21900, 85, "Soft and sweet Arabian dates."),
    (10, "Dried Figs (Anjeer)", "Happilo", "250 g", "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600", 34900, 29900, 50, "Naturally dried figs, high in fibre."),
    (10, "Mixed Dry Fruits", "Happilo", "500 g", "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600", 54900, 46900, 70, "Assorted almonds, cashews, pistachios and raisins."),
    (11, "Tata Tea Premium", "Tata Tea", "1 kg", "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600", 49900, 42900, 110, "Rich and aromatic Assam tea for a strong cup."),
    (11, "Red Label Natural Care", "Brooke Bond", "500 g", "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600", 29900, 25900, 95, "Black tea blended with five ayurvedic herbs."),
    (11, "Taj Mahal Tea", "Taj Mahal", "500 g", "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600", 32900, 28900, 80, "Premium long-leaf tea for a royal cup."),
    (11, "Nescafe Classic Coffee", "Nescafe", "200 g", "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600", 59900, 52900, 75, "100% pure instant coffee with a rich aroma."),
    (11, "Bru Instant Coffee", "Bru", "200 g", "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600", 49900, 43900, 70, "Chicory-blended instant coffee, smooth and frothy."),
    (11, "Green Tea Lemon", "Tetley", "100 g", "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600", 24900, 21900, 60, "Refreshing lemon green tea, rich in antioxidants."),
    (11, "Masala Chai Tea", "Wagh Bakri", "500 g", "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600", 27900, 23900, 85, "Spiced masala chai blend for an authentic cup."),
    (11, "Filter Coffee Powder", "Bru", "500 g", "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600", 39900, 34900, 65, "South Indian filter coffee blend with chicory."),
    (12, "Everest Turmeric Powder", "Everest", "200 g", "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600", 5900, 4900, 180, "Bright and pure haldi powder for everyday cooking."),
    (12, "MDH Deggi Mirch", "MDH", "100 g", "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600", 8900, 7500, 140, "Vibrant red chilli powder with a mild heat."),
    (12, "Everest Garam Masala", "Everest", "100 g", "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600", 8900, 7500, 150, "Aromatic blend of 12 whole spices."),
    (12, "Catch Coriander Powder", "Catch", "200 g", "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600", 6900, 5900, 160, "Freshly ground dhaniya powder."),
    (12, "Cumin Seeds (Jeera)", "Catch", "200 g", "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600", 9900, 8400, 130, "Whole cumin seeds with a warm earthy aroma."),
    (12, "Mustard Seeds (Rai)", "Catch", "100 g", "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600", 3900, 3300, 120, "Small black mustard seeds for tempering."),
    (12, "Chicken Masala", "Everest", "100 g", "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600", 8900, 7500, 100, "Ready spice blend for rich chicken curry."),
    (12, "Sambar Powder", "MTR", "200 g", "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600", 9900, 8400, 90, "Authentic South Indian sambar masala."),
    (13, "Maggi 2-Minute Noodles", "Maggi", "560 g", "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=600", 9900, 8900, 220, "India's favourite masala instant noodles, pack of 8."),
    (13, "Yippee Magic Masala", "Sunfeast", "480 g", "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=600", 8900, 7900, 170, "Long, non-sticky noodles with magic masala."),
    (13, "Top Ramen Curry", "Nissin", "440 g", "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=600", 8900, 7900, 140, "Curry-flavoured instant noodles."),
    (13, "Penne Pasta", "Borges", "500 g", "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=600", 19900, 16900, 90, "Durum wheat penne for pasta bakes and salads."),
    (13, "Fusilli Pasta", "Weikfield", "500 g", "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=600", 17900, 15400, 80, "Spiral fusilli pasta made from durum semolina."),
    (13, "Hakka Noodles", "Ching's", "150 g", "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=600", 5900, 4900, 150, "Non-sticky hakka noodles for Indo-Chinese dishes."),
    (13, "Macaroni Pasta", "Borges", "500 g", "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=600", 17900, 15400, 85, "Classic elbow macaroni for mac and cheese."),
    (13, "Vermicelli (Seviyan)", "Bambino", "400 g", "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=600", 6900, 5900, 110, "Roasted vermicelli for upma and kheer."),
    (14, "Kissan Fresh Tomato Ketchup", "Kissan", "950 g", "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=600", 12900, 10900, 160, "Made from 100% real tomatoes, no onion or garlic."),
    (14, "Maggi Hot & Sweet Tomato Chilli", "Maggi", "1 kg", "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=600", 14900, 12900, 130, "Sweet and spicy tomato chilli sauce."),
    (14, "Veeba Tandoori Mayonnaise", "Veeba", "250 g", "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=600", 9900, 8400, 90, "Creamy tandoori-flavoured eggless mayonnaise."),
    (14, "Ching's Schezwan Chutney", "Ching's", "250 g", "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=600", 9900, 8400, 100, "Spicy Schezwan chutney for Indo-Chinese cooking."),
    (14, "Soy Sauce", "Ching's", "200 g", "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=600", 6900, 5900, 110, "Naturally brewed soy sauce for stir-fries."),
    (14, "Vinegar", "Dabur", "500 ml", "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=600", 4900, 4200, 120, "Synthetic white vinegar for cooking and cleaning."),
    (14, "Pasta & Pizza Sauce", "Veeba", "300 g", "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=600", 11900, 10400, 85, "Herby tomato sauce for pasta and pizza."),
    (14, "Green Chilli Sauce", "Ching's", "200 g", "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=600", 6900, 5900, 95, "Tangy and spicy green chilli sauce."),
    (15, "Kellogg's Corn Flakes", "Kellogg's", "475 g", "https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=600", 24900, 21900, 100, "Crispy golden corn flakes, fortified with vitamins."),
    (15, "Quaker Oats", "Quaker", "1 kg", "https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=600", 21900, 18900, 110, "100% whole grain oats for a healthy breakfast."),
    (15, "Muesli Fruit & Nut", "Kellogg's", "500 g", "https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=600", 34900, 29900, 70, "Crunchy muesli with dried fruits and nuts."),
    (15, "Honey (Pure)", "Dabur", "500 g", "https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=600", 24900, 21900, 90, "100% pure natural honey, no added sugar."),
    (15, "Peanut Butter Crunchy", "Pintola", "1 kg", "https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=600", 39900, 34900, 80, "High-protein crunchy peanut butter."),
    (15, "Choco Spread", "Nutella", "350 g", "https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=600", 44900, 39900, 60, "Hazelnut cocoa spread for toast and pancakes."),
    (15, "Idli Dosa Batter", "MTR", "1 kg", "https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=600", 9900, 8400, 120, "Ready-to-cook fermented idli dosa batter."),
    (15, "Pancake Mix", "Weikfield", "500 g", "https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=600", 19900, 16900, 55, "Instant pancake mix for fluffy pancakes."),
    (16, "Amul Taaza Toned Milk", "Amul", "1 L", "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=600", 7500, 6900, 250, "Homogenised toned milk in a tetra pack."),
    (16, "Amul Butter", "Amul", "500 g", "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=600", 29900, 26900, 140, "Utterly butterly delicious salted butter."),
    (16, "Amul Cheese Slices", "Amul", "200 g", "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=600", 14900, 13400, 100, "Processed cheese slices, pack of 10."),
    (16, "Mother Dairy Curd", "Mother Dairy", "400 g", "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=600", 4900, 4200, 180, "Fresh thick set curd."),
    (16, "Paneer Block", "Amul", "200 g", "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=600", 9900, 8900, 120, "Soft and fresh cottage cheese block."),
    (16, "Nestle Milkmaid", "Nestle", "400 g", "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=600", 16900, 14900, 90, "Sweetened condensed milk for desserts."),
    (16, "Greek Yogurt Blueberry", "Epigamia", "90 g", "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=600", 6900, 5900, 80, "Thick Greek yogurt with blueberry fruit."),
    (16, "Fresh Cream", "Amul", "250 ml", "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=600", 8900, 7900, 95, "Fresh cream for gravies and desserts."),
    (17, "Dettol Original Soap", "Dettol", "125 g", "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600", 4900, 4200, 200, "Antibacterial bathing soap for everyday protection."),
    (17, "Colgate Strong Teeth", "Colgate", "200 g", "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600", 11900, 10400, 180, "Calcium-boost toothpaste for strong teeth."),
    (17, "Head & Shoulders Shampoo", "Head & Shoulders", "340 ml", "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600", 39900, 34900, 90, "Anti-dandruff shampoo for clean, healthy hair."),
    (17, "Nivea Body Lotion", "Nivea", "400 ml", "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600", 34900, 29900, 80, "Deep moisture body lotion for 48-hour hydration."),
    (17, "Gillette Guard Razor", "Gillette", "1 pc", "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600", 4900, 4200, 150, "Safe and smooth shaving razor with a pivoting head."),
    (17, "Dove Beauty Bar", "Dove", "100 g", "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600", 6900, 5900, 130, "Moisturising cream bar for soft, smooth skin."),
    (17, "Whisper Ultra Clean", "Whisper", "15 pads", "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600", 19900, 17400, 100, "Ultra-thin sanitary pads with wings."),
    (17, "Park Avenue Deodorant", "Park Avenue", "150 ml", "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600", 24900, 21900, 70, "Long-lasting fresh deodorant body spray."),
    (18, "Himalaya Neem Face Wash", "Himalaya", "150 ml", "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600", 19900, 17400, 140, "Purifying neem face wash for pimple-prone skin."),
    (18, "Garnier Men Oil Clear", "Garnier", "100 g", "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600", 24900, 21900, 100, "Oil-clearing face wash with charcoal."),
    (18, "Cetaphil Gentle Cleanser", "Cetaphil", "125 ml", "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600", 39900, 34900, 70, "Soap-free gentle cleanser for sensitive skin."),
    (18, "Ponds Pure White Face Wash", "Ponds", "100 g", "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600", 19900, 17400, 110, "Brightening face wash with vitamin B3."),
    (18, "Nivea Men Face Wash", "Nivea", "100 g", "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600", 24900, 21900, 90, "Deep-clean face wash for men."),
    (18, "Mamaearth Ubtan Face Wash", "Mamaearth", "100 ml", "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600", 29900, 25900, 80, "Turmeric and saffron face wash for glowing skin."),
    (18, "Clean & Clear Foaming Face Wash", "Clean & Clear", "150 ml", "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600", 22900, 19900, 95, "Oil-free foaming face wash for clear skin."),
    (18, "Biotique Bio Honey Face Wash", "Biotique", "150 ml", "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600", 24900, 21900, 75, "Ayurvedic honey gel face wash."),
    (19, "Ponds Cold Cream", "Ponds", "100 ml", "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=600", 19900, 17400, 100, "Classic cold cream for deep moisturising."),
    (19, "Nivea Soft Cream", "Nivea", "200 ml", "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=600", 34900, 29900, 90, "Light moisturising cream with jojoba oil."),
    (19, "Lakme Peach Milk Moisturizer", "Lakme", "120 ml", "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=600", 29900, 25900, 80, "Light moisturiser with peach milk extracts."),
    (19, "Himalaya Nourishing Cream", "Himalaya", "150 ml", "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=600", 24900, 21900, 85, "Nourishing skin cream with herbal extracts."),
    (19, "Biotique Bio Saffron Cream", "Biotique", "50 g", "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=600", 34900, 29900, 60, "Saffron day cream for a radiant glow."),
    (19, "Vaseline Petroleum Jelly", "Vaseline", "170 g", "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=600", 19900, 17400, 110, "Pure petroleum jelly for dry skin."),
    (19, "Mamaearth Vitamin C Cream", "Mamaearth", "50 g", "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=600", 39900, 34900, 65, "Vitamin C face cream for brightening."),
    (19, "Fair & Lovely Advanced Cream", "Fair & Lovely", "80 g", "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=600", 24900, 21900, 95, "Advanced multivitamin face cream."),
    (20, "Clinic Plus Shampoo", "Clinic Plus", "355 ml", "https://images.unsplash.com/photo-1585232004423-244e0e6904e3?w=600", 24900, 21900, 130, "Strong and long health shampoo with milk protein."),
    (20, "Dove Intense Repair Shampoo", "Dove", "340 ml", "https://images.unsplash.com/photo-1585232004423-244e0e6904e3?w=600", 39900, 34900, 90, "Repairing shampoo for damaged hair."),
    (20, "Parachute Advansed Hair Oil", "Parachute", "300 ml", "https://images.unsplash.com/photo-1585232004423-244e0e6904e3?w=600", 19900, 17400, 140, "Nourishing coconut hair oil for strong hair."),
    (20, "Head & Shoulders Cool Menthol", "Head & Shoulders", "340 ml", "https://images.unsplash.com/photo-1585232004423-244e0e6904e3?w=600", 39900, 34900, 85, "Cooling menthol anti-dandruff shampoo."),
    (20, "Sunsilk Black Shine Shampoo", "Sunsilk", "340 ml", "https://images.unsplash.com/photo-1585232004423-244e0e6904e3?w=600", 29900, 25900, 100, "Shampoo for shiny, black hair."),
    (20, "Indulekha Bringha Oil", "Indulekha", "100 ml", "https://images.unsplash.com/photo-1585232004423-244e0e6904e3?w=600", 44900, 39900, 60, "Ayurvedic hair oil for hair fall control."),
    (20, "Tresemme Keratin Smooth", "Tresemme", "340 ml", "https://images.unsplash.com/photo-1585232004423-244e0e6904e3?w=600", 44900, 39900, 70, "Smoothing shampoo with keratin and argan oil."),
    (20, "Dabur Amla Hair Oil", "Dabur", "450 ml", "https://images.unsplash.com/photo-1585232004423-244e0e6904e3?w=600", 24900, 21900, 120, "Amla hair oil for strong and healthy hair."),
    (21, "Lux Soft Glow Soap", "Lux", "150 g", "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600", 4900, 4200, 180, "Rose and vitamin E beauty soap."),
    (21, "Santoor Sandal Soap", "Santoor", "150 g", "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600", 4900, 4200, 170, "Sandalwood and turmeric soap for soft skin."),
    (21, "Medimix Ayurvedic Soap", "Medimix", "125 g", "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600", 4900, 4200, 160, "Ayurvedic soap with 18 herbs."),
    (21, "Dettol Cool Soap", "Dettol", "125 g", "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600", 4900, 4200, 190, "Antibacterial soap with a cool menthol burst."),
    (21, "Nivea Shower Gel", "Nivea", "250 ml", "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600", 29900, 25900, 80, "Refreshing shower gel with aloe vera."),
    (21, "Fiama Gel Bar", "Fiama", "125 g", "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600", 5900, 4900, 120, "Gel bar with peach and avocado oil."),
    (21, "Pears Pure & Gentle Soap", "Pears", "125 g", "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600", 6900, 5900, 110, "Glycerine soap for gentle cleansing."),
    (21, "Cinthol Original Soap", "Cinthol", "100 g", "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600", 4900, 4200, 150, "Deodorant soap for all-day freshness."),
    (22, "Colgate MaxFresh Toothpaste", "Colgate", "300 g", "https://images.unsplash.com/photo-1559591937-abc3a5b1f4c1?w=600", 19900, 17400, 150, "Cooling crystal toothpaste for fresh breath."),
    (22, "Pepsodent Germicheck", "Pepsodent", "200 g", "https://images.unsplash.com/photo-1559591937-abc3a5b1f4c1?w=600", 11900, 10400, 140, "Germ protection toothpaste for healthy teeth."),
    (22, "Sensodyne Rapid Relief", "Sensodyne", "100 g", "https://images.unsplash.com/photo-1559591937-abc3a5b1f4c1?w=600", 19900, 17400, 90, "Toothpaste for sensitive teeth relief."),
    (22, "Oral-B Toothbrush", "Oral-B", "2 pcs", "https://images.unsplash.com/photo-1559591937-abc3a5b1f4c1?w=600", 9900, 8400, 130, "Soft-bristle toothbrush for gentle cleaning."),
    (22, "Listerine Mouthwash", "Listerine", "250 ml", "https://images.unsplash.com/photo-1559591937-abc3a5b1f4c1?w=600", 24900, 21900, 80, "Antiseptic mouthwash for fresh breath."),
    (22, "Dabur Red Toothpaste", "Dabur", "200 g", "https://images.unsplash.com/photo-1559591937-abc3a5b1f4c1?w=600", 11900, 10400, 120, "Ayurvedic toothpaste with 13 herbs."),
    (22, "Colgate Kids Toothpaste", "Colgate", "80 g", "https://images.unsplash.com/photo-1559591937-abc3a5b1f4c1?w=600", 9900, 8400, 100, "Bubble fruit-flavoured toothpaste for kids."),
    (22, "Dental Floss", "Oral-B", "50 m", "https://images.unsplash.com/photo-1559591937-abc3a5b1f4c1?w=600", 14900, 12900, 70, "Waxed dental floss for interdental cleaning."),
    (23, "Lizol Floor Cleaner Citrus", "Lizol", "975 ml", "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600", 24900, 21900, 120, "Disinfectant floor cleaner with a citrus fragrance."),
    (23, "Colin Glass Cleaner", "Colin", "500 ml", "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600", 11900, 10400, 110, "Streak-free glass and surface cleaner."),
    (23, "Harpic Bathroom Cleaner", "Harpic", "1 L", "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600", 21900, 19400, 100, "Thick bathroom cleaner that clings to surfaces."),
    (23, "Domex Toilet Cleaner", "Domex", "1 L", "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600", 21900, 19400, 95, "Disinfectant toilet cleaner for a sparkling bowl."),
    (23, "Good Knight Refill", "Good Knight", "45 ml", "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600", 9900, 8400, 140, "Mosquito repellent refill for the advanced machine."),
    (23, "Odonil Air Freshener", "Odonil", "50 g", "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600", 6900, 5900, 130, "Long-lasting room air freshener block."),
    (23, "Scotch Brite Scrub Pad", "Scotch Brite", "3 pcs", "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600", 5900, 4900, 160, "Heavy-duty scrub pads for tough stains."),
    (23, "Garbage Bags Medium", "Presto", "30 pcs", "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600", 14900, 12900, 120, "Biodegradable medium garbage bags."),
    (24, "Harpic Power Plus Toilet Cleaner", "Harpic", "1 L", "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600", 24900, 21900, 110, "Powerful toilet cleaner that removes tough stains."),
    (24, "Harpic Toilet Cleaner Lemon", "Harpic", "500 ml", "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600", 14900, 12900, 120, "Lemon-fresh toilet cleaner for daily use."),
    (24, "Domex Toilet Cleaner Fresh", "Domex", "500 ml", "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600", 13900, 11900, 115, "Fresh-scented disinfectant toilet cleaner."),
    (24, "Harpic Toilet Cleaning Brush", "Harpic", "1 pc", "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600", 9900, 8400, 90, "Ergonomic toilet brush with a storage holder."),
    (24, "Harpic Flushmatic", "Harpic", "50 g", "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600", 11900, 10400, 100, "In-cistern toilet cleaner block."),
    (24, "Toilet Seat Sanitizer", "Pee Safe", "100 ml", "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600", 19900, 17400, 70, "Disinfectant spray for toilet seats."),
    (24, "Domex Ultra Shine", "Domex", "1 L", "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600", 22900, 19900, 85, "Ultra shine toilet cleaner with a floral scent."),
    (24, "Harpic Bathroom Wipes", "Harpic", "40 pcs", "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600", 14900, 12900, 75, "Disinfectant wipes for bathroom surfaces."),
    (25, "Vim Dishwash Gel Lemon", "Vim", "750 ml", "https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=600", 19900, 17400, 150, "Concentrated lemon dishwash gel for sparkling utensils."),
    (25, "Vim Dishwash Bar", "Vim", "300 g", "https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=600", 4900, 4200, 180, "Tough-on-grease dishwash bar with lemon."),
    (25, "Pril Dishwash Liquid", "Pril", "750 ml", "https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=600", 21900, 19400, 120, "Effective dishwashing liquid with a fresh scent."),
    (25, "Scotch Brite Scrub Sponge", "Scotch Brite", "3 pcs", "https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=600", 7900, 6900, 140, "Dual-sided sponge for gentle and tough cleaning."),
    (25, "Vim Dishwash Powder", "Vim", "1 kg", "https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=600", 14900, 12900, 100, "Lemon dishwash powder for heavy grease."),
    (25, "Kitchen Cleaner Spray", "Cif", "500 ml", "https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=600", 24900, 21900, 85, "Degreasing kitchen surface cleaner."),
    (25, "Steel Scrubber", "Presto", "3 pcs", "https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=600", 5900, 4900, 130, "Stainless steel scrubbers for burnt pans."),
    (25, "Dishwash Liquid Refill", "Vim", "2 L", "https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=600", 39900, 34900, 90, "Value refill pack of lemon dishwash gel."),
    (26, "Surf Excel Easy Wash", "Surf Excel", "1 kg", "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600", 14900, 12900, 160, "Detergent powder for everyday machine and hand wash."),
    (26, "Ariel Matic Front Load", "Ariel", "2 kg", "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600", 49900, 43900, 110, "Front-load detergent for a deep clean."),
    (26, "Rin Detergent Bar", "Rin", "250 g", "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600", 2900, 2500, 200, "Detergent bar for stain removal."),
    (26, "Comfort Fabric Conditioner", "Comfort", "860 ml", "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600", 24900, 21900, 100, "After-wash fabric conditioner with a floral scent."),
    (26, "Tide Plus Detergent", "Tide", "1 kg", "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600", 13900, 11900, 140, "Detergent powder with a brightening formula."),
    (26, "Nirma Washing Powder", "Nirma", "1 kg", "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600", 9900, 8400, 150, "Economical washing powder for daily laundry."),
    (26, "Vanish Stain Remover", "Vanish", "500 ml", "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600", 29900, 25900, 80, "Oxygen-based stain remover liquid."),
    (26, "Ujala Fabric Whitener", "Ujala", "500 ml", "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600", 9900, 8400, 120, "Liquid fabric whitener for bright clothes."),
    (27, "Match Box", "Homelites", "10 pcs", "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600", 2900, 2500, 200, "Safety match boxes, pack of 10."),
    (27, "Aluminium Foil", "Freshee", "72 m", "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600", 19900, 17400, 90, "Food-grade aluminium foil for wrapping and baking."),
    (27, "Cling Film", "Freshee", "30 m", "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600", 14900, 12900, 85, "Food wrap cling film for freshness."),
    (27, "Paper Napkins", "Origami", "100 pcs", "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600", 9900, 8400, 130, "Soft and absorbent paper napkins."),
    (27, "Toothpicks", "Presto", "100 pcs", "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600", 2900, 2500, 150, "Wooden toothpicks for serving and hygiene."),
    (27, "Candles", "Homelites", "10 pcs", "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600", 4900, 4200, 120, "Wax candles for emergency lighting."),
    (27, "Battery AA", "Duracell", "4 pcs", "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600", 19900, 17400, 100, "Long-lasting alkaline AA batteries."),
    (27, "Cotton Balls", "Presto", "100 pcs", "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600", 5900, 4900, 110, "Soft absorbent cotton balls for personal care."),
  ];

  let couponSeeds : [(Text, Text, Nat, Nat, Nat, Bool)] = [
    ("WELCOME10", "Get 10% off on your first order above ₹299", 10, 29900, 10000, true),
    ("SAVE50", "Flat 15% off on orders above ₹499", 15, 49900, 20000, true),
    ("GROCERY20", "20% off on orders above ₹999", 20, 99900, 30000, true),
    ("FREESHIP", "5% off on orders above ₹199", 5, 19900, 5000, true),
    ("DIWALI25", "Festive 25% off on orders above ₹1499", 25, 149900, 50000, true),
  ];

  public func migration(_ : OldActor) : NewActor {
    let products = Map.empty<Nat, ProductInternal>();
    let categories = Map.empty<Nat, CategoryInternal>();
    let coupons = Map.empty<Nat, CouponInternal>();

    var categoryId = 1;
    for ((name, imageUrl) in categorySeeds.values()) {
      categories.add(categoryId, { id = categoryId; name; imageUrl });
      categoryId += 1;
    };

    var productId = 1;
    for ((catId, name, brand, packSize, imageUrl, originalPrice, discountPrice, stockQuantity, description) in productSeeds.values()) {
      products.add(productId, {
        id = productId;
        categoryId = catId;
        name;
        brand;
        packSize;
        imageUrl;
        originalPrice;
        discountPrice;
        stockQuantity;
        description;
        createdAt = 0;
      });
      productId += 1;
    };

    var couponId = 1;
    for ((code, description, discountPercent, minOrderValue, maxDiscount, active) in couponSeeds.values()) {
      coupons.add(couponId, {
        id = couponId;
        code;
        description;
        discountPercent;
        minOrderValue;
        maxDiscount;
        active;
      });
      couponId += 1;
    };

    {
      accessControlState = AccessControl.initState();
      products;
      categories;
      coupons;
      catalogState = { var nextProductId = productId; var nextCategoryId = categoryId; var nextCouponId = couponId };
      carts = Map.empty();
      cartCoupons = Map.empty();
      orders = Map.empty();
      cartState = { var nextOrderId = 0 };
      profiles = Map.empty();
      emails = Map.empty();
      addresses = Map.empty();
      wishlists = Map.empty();
      recentlyViewed = Map.empty();
      notifications = Map.empty();
      accountState = { var nextAddressId = 0; var nextNotificationId = 0 };
    };
  };
};
