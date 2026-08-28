export type Locale = 'en' | 'ar'

export const LOCALES: Locale[] = ['en', 'ar']
export const DEFAULT_LOCALE: Locale = 'en'

// Flat dictionary, dot-namespaced keys. Admin pages (/admin/*) are
// deliberately left untranslated — that's an internal tool for the
// business owner, not customer-facing.
export const translations = {
  'nav.shop': { en: 'Shop', ar: 'المتجر' },
  'nav.orders': { en: 'Orders', ar: 'الطلبات' },
  'nav.cart': { en: 'Cart', ar: 'السلة' },
  'nav.account': { en: 'Account', ar: 'الحساب' },
  'nav.logout': { en: 'Log out', ar: 'تسجيل الخروج' },
  'nav.login': { en: 'Log in', ar: 'تسجيل الدخول' },

  'auth.signup.title': { en: 'Create your account', ar: 'أنشئ حسابك' },
  'auth.signup.subtitle': {
    en: "Just your name and number — no password.",
    ar: 'فقط اسمك ورقم جوالك — بدون كلمة مرور.',
  },
  'auth.fullName': { en: 'Full name', ar: 'الاسم الكامل' },
  'auth.mobileNumber': { en: 'Mobile number', ar: 'رقم الجوال' },
  'auth.signup.submit': { en: 'Create account', ar: 'إنشاء حساب' },
  'auth.signup.submitting': { en: 'Creating account…', ar: 'جارٍ إنشاء الحساب…' },
  'auth.signup.haveAccount': { en: 'Already have an account?', ar: 'لديك حساب بالفعل؟' },
  'auth.login.title': { en: 'Log in', ar: 'تسجيل الدخول' },
  'auth.login.subtitle': { en: 'Enter your mobile number.', ar: 'أدخل رقم جوالك.' },
  'auth.login.submit': { en: 'Log in', ar: 'تسجيل الدخول' },
  'auth.login.submitting': { en: 'Logging in…', ar: 'جارٍ تسجيل الدخول…' },
  'auth.login.newHere': { en: 'New here?', ar: 'جديد هنا؟' },
  'auth.login.createAccount': { en: 'Create an account', ar: 'إنشاء حساب' },
  'auth.error.invalidPhone': {
    en: 'Enter a valid Saudi mobile number, e.g. 05XXXXXXXX.',
    ar: 'أدخل رقم جوال سعودي صحيح، مثال: 05XXXXXXXX.',
  },
  'auth.error.unrecognizedNumber': {
    en: "We don't recognize that number — enter your name to create an account.",
    ar: 'هذا الرقم غير مسجّل — أدخل اسمك لإنشاء حساب.',
  },
  'auth.error.couldNotCreate': { en: 'Could not create account.', ar: 'تعذّر إنشاء الحساب.' },

  'shop.byCategory': { en: 'Shop by category', ar: 'تسوّق حسب الفئة' },
  'shop.backToCategories': { en: 'Back', ar: 'رجوع' },
  'shop.noCategories': { en: 'No categories yet.', ar: 'لا توجد فئات بعد.' },
  'shop.noProducts': { en: 'No products in this category yet.', ar: 'لا توجد منتجات في هذه الفئة بعد.' },
  'shop.outOfStock': { en: 'Out of stock', ar: 'غير متوفر' },
  'shop.addToCart': { en: 'Add to cart', ar: 'أضف إلى السلة' },
  'shop.adding': { en: 'Adding…', ar: 'جارٍ الإضافة…' },
  'shop.added': { en: 'Added ✓', ar: 'أُضيف ✓' },

  'cart.title': { en: 'Your cart', ar: 'سلتك' },
  'cart.empty': { en: 'Your cart is empty.', ar: 'سلتك فارغة.' },
  'cart.startShopping': { en: 'Start shopping', ar: 'ابدأ التسوق' },
  'cart.total': { en: 'Total', ar: 'الإجمالي' },
  'cart.checkout': { en: 'Checkout', ar: 'إتمام الطلب' },
  'cart.remove': { en: 'Remove', ar: 'إزالة' },
  'cart.error.mustBeLoggedIn': { en: 'Must be logged in', ar: 'يجب تسجيل الدخول' },

  'address.title': { en: 'Delivery location', ar: 'موقع التوصيل' },
  'address.subtitle': {
    en: "We need this to confirm you're within our delivery area.",
    ar: 'نحتاج هذا للتأكد من أنك داخل نطاق التوصيل لدينا.',
  },
  'address.useMyLocation': { en: '📍 Use my current location', ar: '📍 استخدم موقعي الحالي' },
  'address.locating': { en: 'Locating…', ar: 'جارٍ تحديد الموقع…' },
  'address.dragPinHint': {
    en: 'Drag the pin or tap the map to set your exact delivery location.',
    ar: 'اسحب الدبوس أو انقر على الخريطة لتحديد موقع التوصيل الدقيق.',
  },
  'address.label': { en: 'Label', ar: 'التسمية' },
  'address.labelPlaceholder': { en: 'Home', ar: 'المنزل' },
  'address.details': { en: 'Address details (building, street, apartment)', ar: 'تفاصيل العنوان (المبنى، الشارع، الشقة)' },
  'address.city': { en: 'City', ar: 'المدينة' },
  'address.continue': { en: 'Continue to checkout', ar: 'متابعة إلى الدفع' },
  'address.checking': { en: 'Checking…', ar: 'جارٍ التحقق…' },
  'address.outsideTitle': {
    en: "Sorry, we don't deliver there yet",
    ar: 'عذرًا، لا نوصّل إلى هناك حتى الآن',
  },
  'address.outsideBody': {
    en: "That location is outside our current delivery area. We're expanding regularly — check back soon.",
    ar: 'هذا الموقع خارج نطاق التوصيل الحالي لدينا. نحن نتوسع باستمرار — تحقق مرة أخرى قريبًا.',
  },
  'address.backToCart': { en: 'Back to cart', ar: 'العودة إلى السلة' },
  'address.error.needLocation': {
    en: 'Please share or select your location on the map.',
    ar: 'يرجى مشاركة أو تحديد موقعك على الخريطة.',
  },
  'address.error.mustBeLoggedIn': { en: 'You must be logged in.', ar: 'يجب تسجيل الدخول.' },
  'address.error.couldNotSave': { en: 'Could not save address.', ar: 'تعذّر حفظ العنوان.' },

  'checkout.title': { en: 'Review & pay', ar: 'المراجعة والدفع' },
  'checkout.deliveringTo': { en: 'Delivering to', ar: 'التوصيل إلى' },
  'checkout.items': { en: 'Items', ar: 'العناصر' },
  'checkout.total': { en: 'Total', ar: 'الإجمالي' },
  'checkout.paymentMethod': { en: 'Payment method', ar: 'طريقة الدفع' },
  'checkout.payOnline': { en: 'Pay online (mada / card / Apple Pay)', ar: 'الدفع الإلكتروني (مدى / بطاقة / Apple Pay)' },
  'checkout.cashOnDelivery': { en: 'Cash on delivery', ar: 'الدفع عند الاستلام' },
  'checkout.continueToPayment': { en: 'Continue to payment', ar: 'المتابعة إلى الدفع' },
  'checkout.placeOrder': { en: 'Place order', ar: 'إتمام الطلب' },
  'checkout.placingOrder': { en: 'Placing order…', ar: 'جارٍ إتمام الطلب…' },
  'checkout.error.missingAddress': { en: 'Missing delivery address.', ar: 'عنوان التوصيل مفقود.' },
  'checkout.error.choosePayment': { en: 'Choose a payment method.', ar: 'اختر طريقة الدفع.' },
  'checkout.error.mustBeLoggedIn': { en: 'You must be logged in.', ar: 'يجب تسجيل الدخول.' },
  'checkout.error.addressNotFound': { en: 'Address not found.', ar: 'العنوان غير موجود.' },
  'checkout.error.outsideArea': {
    en: 'This address is outside our delivery area.',
    ar: 'هذا العنوان خارج نطاق التوصيل لدينا.',
  },
  'checkout.error.emptyCart': { en: 'Your cart is empty.', ar: 'سلتك فارغة.' },
  'checkout.error.couldNotCreate': { en: 'Could not create order.', ar: 'تعذّر إنشاء الطلب.' },
  'checkout.pay.heading': { en: 'Pay', ar: 'ادفع' },
  'checkout.pay.order': { en: 'Order', ar: 'الطلب' },

  'orders.current': { en: 'Current orders', ar: 'الطلبات الحالية' },
  'orders.noActive': { en: 'No active orders.', ar: 'لا توجد طلبات نشطة.' },
  'orders.past': { en: 'Past orders', ar: 'الطلبات السابقة' },
  'orders.noPast': { en: 'No past orders yet.', ar: 'لا توجد طلبات سابقة بعد.' },
  'orders.order': { en: 'Order', ar: 'الطلب' },
  'orders.placed': { en: 'Placed', ar: 'تاريخ الطلب' },
  'orders.cancelled': { en: 'This order was cancelled.', ar: 'تم إلغاء هذا الطلب.' },
  'orders.items': { en: 'Items', ar: 'العناصر' },
  'orders.total': { en: 'Total', ar: 'الإجمالي' },
  'orders.payment': { en: 'Payment', ar: 'الدفع' },
  'orders.paidOnline': { en: 'Paid online', ar: 'مدفوع إلكترونيًا' },
  'orders.cashOnDelivery': { en: 'Cash on delivery', ar: 'الدفع عند الاستلام' },
  'orders.pendingSuffix': { en: '(pending)', ar: '(قيد الانتظار)' },
  'orders.deliveryProof': { en: 'Delivery proof', ar: 'إثبات التسليم' },
  'status.pending': { en: 'Pending', ar: 'قيد الانتظار' },
  'status.confirmed': { en: 'Confirmed', ar: 'مؤكد' },
  'status.out_for_delivery': { en: 'Out for Delivery', ar: 'قيد التوصيل' },
  'status.completed': { en: 'Completed', ar: 'مكتمل' },
  'status.cancelled': { en: 'Cancelled', ar: 'ملغى' },

  'account.title': { en: 'Account', ar: 'الحساب' },
  'account.name': { en: 'Name', ar: 'الاسم' },
  'account.phone': { en: 'Phone', ar: 'الجوال' },
  'account.savedAddresses': { en: 'Saved addresses', ar: 'العناوين المحفوظة' },
  'account.noAddresses': {
    en: "No saved addresses yet — you'll add one at checkout.",
    ar: 'لا توجد عناوين محفوظة بعد — ستضيف واحدًا عند إتمام الطلب.',
  },
  'account.withinArea': { en: 'Within delivery area', ar: 'ضمن نطاق التوصيل' },
  'account.outsideArea': { en: 'Outside delivery area', ar: 'خارج نطاق التوصيل' },

  'lang.toggle': { en: 'العربية', ar: 'English' },
  'whatsapp.chat': { en: 'Chat on WhatsApp', ar: 'تواصل عبر واتساب' },
} as const

export type TranslationKey = keyof typeof translations

export function translate(locale: Locale, key: TranslationKey): string {
  return translations[key][locale]
}

// Category names live in the DB (no name_ar column), so translate the seed
// categories by slug here and fall back to the DB name for anything unknown.
const categoryTranslations: Record<string, { en: string; ar: string }> = {
  'water-bottles': { en: 'Water Bottles', ar: 'زجاجات المياه' },
  dispensers: { en: 'Dispensers', ar: 'موزعات المياه' },
  accessories: { en: 'Accessories', ar: 'الإكسسوارات' },
}

export function translateCategoryName(locale: Locale, category: { slug: string; name: string }): string {
  return categoryTranslations[category.slug]?.[locale] ?? category.name
}
