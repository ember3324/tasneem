export type Locale = 'ar'

// Flat dictionary, dot-namespaced keys. Admin pages (/admin/*) are
// deliberately left untranslated — that's an internal tool for the
// business owner, not customer-facing.
export const translations = {
  'nav.shop': 'المتجر',
  'nav.orders': 'الطلبات',
  'nav.cart': 'السلة',
  'nav.account': 'الحساب',
  'nav.logout': 'تسجيل الخروج',
  'nav.login': 'تسجيل الدخول',
  'nav.policies': 'السياسات',

  'auth.signup.title': 'أنشئ حسابك',
  'auth.signup.subtitle': 'فقط اسمك ورقم جوالك — بدون كلمة مرور.',
  'auth.fullName': 'الاسم الكامل',
  'auth.mobileNumber': 'رقم الجوال',
  'auth.signup.submit': 'إنشاء حساب',
  'auth.signup.submitting': 'جارٍ إنشاء الحساب…',
  'auth.signup.haveAccount': 'لديك حساب بالفعل؟',
  'auth.login.title': 'تسجيل الدخول',
  'auth.login.subtitle': 'أدخل رقم جوالك.',
  'auth.login.submit': 'تسجيل الدخول',
  'auth.login.submitting': 'جارٍ تسجيل الدخول…',
  'auth.login.newHere': 'جديد هنا؟',
  'auth.login.createAccount': 'إنشاء حساب',
  'auth.error.invalidPhone': 'أدخل رقم جوال سعودي صحيح، مثال: 05XXXXXXXX.',
  'auth.error.unrecognizedNumber': 'هذا الرقم غير مسجّل — أدخل اسمك لإنشاء حساب.',
  'auth.error.couldNotCreate': 'تعذّر إنشاء الحساب.',

  'shop.title': 'المنتجات',
  'shop.noProducts': 'لا توجد منتجات بعد.',
  'shop.outOfStock': 'غير متوفر',
  'shop.addToCart': 'أضف إلى السلة',
  'shop.adding': 'جارٍ الإضافة…',
  'shop.added': 'أُضيف ✓',

  'cart.title': 'سلتك',
  'cart.empty': 'سلتك فارغة.',
  'cart.startShopping': 'ابدأ التسوق',
  'cart.total': 'الإجمالي',
  'cart.checkout': 'إتمام الطلب',
  'cart.remove': 'إزالة',
  'cart.error.mustBeLoggedIn': 'يجب تسجيل الدخول',

  'address.title': 'موقع التوصيل',
  'address.subtitle': 'نحتاج هذا للتأكد من أنك داخل نطاق التوصيل لدينا.',
  'address.chooseAddress': 'اختر عنوان التوصيل',
  'address.deliverHere': 'التوصيل هنا',
  'address.addNew': 'أضف عنوانًا جديدًا',
  'address.useMyLocation': '📍 استخدم موقعي الحالي',
  'address.locating': 'جارٍ تحديد الموقع…',
  'address.dragPinHint': 'اسحب الدبوس أو انقر على الخريطة لتحديد موقع التوصيل الدقيق.',
  'address.label': 'التسمية',
  'address.labelPlaceholder': 'المنزل',
  'address.details': 'تفاصيل العنوان (المبنى، الشارع، الشقة)',
  'address.continue': 'متابعة إلى الدفع',
  'address.checking': 'جارٍ التحقق…',
  'address.outsideTitle': 'عذرًا، لا نوصّل إلى هناك حتى الآن',
  'address.outsideBody': 'هذا الموقع خارج نطاق التوصيل الحالي لدينا. نحن نتوسع باستمرار — تحقق مرة أخرى قريبًا.',
  'address.backToCart': 'العودة إلى السلة',
  'address.error.needLocation': 'يرجى مشاركة أو تحديد موقعك على الخريطة.',
  'address.error.mustBeLoggedIn': 'يجب تسجيل الدخول.',
  'address.error.couldNotSave': 'تعذّر حفظ العنوان.',

  'checkout.title': 'المراجعة والدفع',
  'checkout.deliveringTo': 'التوصيل إلى',
  'checkout.items': 'العناصر',
  'checkout.total': 'الإجمالي',
  'checkout.paymentMethod': 'طريقة الدفع',
  'checkout.payOnline': 'الدفع الإلكتروني (مدى / بطاقة / Apple Pay)',
  'checkout.cashOnDelivery': 'الدفع عند الاستلام',
  'checkout.continueToPayment': 'المتابعة إلى الدفع',
  'checkout.placeOrder': 'إتمام الطلب',
  'checkout.placingOrder': 'جارٍ إتمام الطلب…',
  'checkout.error.missingAddress': 'عنوان التوصيل مفقود.',
  'checkout.error.choosePayment': 'اختر طريقة الدفع.',
  'checkout.error.mustBeLoggedIn': 'يجب تسجيل الدخول.',
  'checkout.error.addressNotFound': 'العنوان غير موجود.',
  'checkout.error.outsideArea': 'هذا العنوان خارج نطاق التوصيل لدينا.',
  'checkout.error.emptyCart': 'سلتك فارغة.',
  'checkout.error.couldNotCreate': 'تعذّر إنشاء الطلب.',
  'checkout.pay.heading': 'ادفع',
  'checkout.pay.order': 'الطلب',

  'orders.current': 'الطلبات الحالية',
  'orders.noActive': 'لا توجد طلبات نشطة.',
  'orders.past': 'الطلبات السابقة',
  'orders.noPast': 'لا توجد طلبات سابقة بعد.',
  'orders.order': 'الطلب',
  'orders.placed': 'تاريخ الطلب',
  'orders.cancelled': 'تم إلغاء هذا الطلب.',
  'orders.items': 'العناصر',
  'orders.total': 'الإجمالي',
  'orders.payment': 'الدفع',
  'orders.paidOnline': 'مدفوع إلكترونيًا',
  'orders.cashOnDelivery': 'الدفع عند الاستلام',
  'orders.pendingSuffix': '(قيد الانتظار)',
  'orders.deliveryProof': 'إثبات التسليم',
  'status.pending': 'قيد الانتظار',
  'status.confirmed': 'مؤكد',
  'status.out_for_delivery': 'قيد التوصيل',
  'status.completed': 'مكتمل',
  'status.cancelled': 'ملغى',

  'account.title': 'الحساب',
  'account.name': 'الاسم',
  'account.phone': 'الجوال',
  'account.savedAddresses': 'العناوين المحفوظة',
  'account.noAddresses': 'لا توجد عناوين محفوظة بعد — ستضيف واحدًا عند إتمام الطلب.',
  'account.withinArea': 'ضمن نطاق التوصيل',
  'account.outsideArea': 'خارج نطاق التوصيل',
  'account.addressInUse': 'هذا العنوان مستخدم في طلب سابق ولا يمكن إزالته.',

  'whatsapp.chat': 'تواصل عبر واتساب',
} as const

export type TranslationKey = keyof typeof translations

export function translate(_locale: Locale, key: TranslationKey): string {
  return translations[key]
}

// Product names are stored in Arabic in the DB directly (the real,
// canonical name for this market — also what shows up in order summaries
// and the admin Google Sheet), so this is just a passthrough. Kept as a
// function (rather than inlining `product.name` at every call site) in case
// a slug-keyed override is ever needed again.
export function translateProductName(_locale: Locale, product: { slug: string; name: string }): string {
  return product.name
}
