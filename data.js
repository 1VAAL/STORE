/* ==========================================================================
   بيانات المتجر — عدّل المنتجات والتصنيفات من هنا
   ========================================================================== */

const CATEGORIES = [
  { id: 'figures',     label: 'فيجرز',        emoji: '🗿' },
  { id: 'plushies',    label: 'بلوشيز',       emoji: '🧸' },
  { id: 'clothing',    label: 'ملابس',        emoji: '👕' },
  { id: 'accessories', label: 'إكسسوارات',    emoji: '💍' },
  { id: 'keychains',   label: 'ميداليات',     emoji: '🔑' },
  { id: 'posters',     label: 'بوسترات',      emoji: '🖼️' },
];

const PRODUCTS = [
  { id:'p1', name:'فيجر لومين — إصدار خاص', category:'figures', price:45, oldPrice:60, rating:4.8, reviews:132,
    image:'https://images.unsplash.com/photo-1608889175638-9e0c30ab4e50?w=600&q=80',
    description:'فيجر عالي الجودة بارتفاع 25 سم، منحوت بدقة تفاصيل عالية ومطلي يدويًا.',
    specs:['الارتفاع: 25 سم','المادة: PVC عالي الجودة','يشمل قاعدة عرض'] },
  { id:'p2', name:'دمية محشوة قطة سحرية', category:'plushies', price:18, oldPrice:null, rating:4.6, reviews:87,
    image:'https://images.unsplash.com/photo-1591561582301-7ce6588cc286?w=600&q=80',
    description:'دمية ناعمة جدًا مثالية للهدايا، حشوة قطنية آمنة وقابلة للغسيل.',
    specs:['الحجم: 30 سم','المادة: قطيفة ناعمة','قابلة للغسيل'] },
  { id:'p3', name:'هودي أنمي أسود', category:'clothing', price:32, oldPrice:40, rating:4.5, reviews:54,
    image:'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80',
    description:'هودي قطن مريح بطبعة حصرية، متوفر بعدة مقاسات.',
    specs:['المقاسات: S - XXL','المادة: 80% قطن 20% بوليستر'],
    variants:{ size:['S','M','L','XL','XXL'] } },
  { id:'p4', name:'قلادة رمز عنصري', category:'accessories', price:12, oldPrice:null, rating:4.3, reviews:41,
    image:'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80',
    description:'قلادة معدنية أنيقة بتصميم مستوحى من عالم الأنمي.',
    specs:['المادة: ستانلس ستيل','طول السلسلة: 50 سم'] },
  { id:'p5', name:'ميدالية مفاتيح شخصيات', category:'keychains', price:6, oldPrice:8, rating:4.7, reviews:210,
    image:'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&q=80',
    description:'مجموعة ميداليات مفاتيح بتصميمات متنوعة، خامة أكريليك مقاومة للكسر.',
    specs:['المادة: أكريليك','الحجم: 5 سم'] },
  { id:'p6', name:'بوستر أنمي مقاس A2', category:'posters', price:9, oldPrice:null, rating:4.4, reviews:63,
    image:'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&q=80',
    description:'بوستر عالي الدقة مطبوع على ورق لامع سميك.',
    specs:['المقاس: A2 (42×59 سم)','الطباعة: لامعة عالية الدقة'] },
  { id:'p7', name:'فيجر محارب الظل', category:'figures', price:55, oldPrice:70, rating:4.9, reviews:98,
    image:'https://images.unsplash.com/photo-1633873734461-8e33ba51d81b?w=600&q=80',
    description:'فيجر تفصيلي بوضعية قتالية ديناميكية مع إضاءة LED بالقاعدة.',
    specs:['الارتفاع: 28 سم','يشمل إضاءة LED'] },
  { id:'p8', name:'تيشيرت طبعة محدودة', category:'clothing', price:20, oldPrice:null, rating:4.2, reviews:29,
    image:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
    description:'تيشيرت قطن 100% بطبعة حصرية لا تتكرر.',
    specs:['المقاسات: S - XL','المادة: قطن 100%'],
    variants:{ size:['S','M','L','XL'] } },
];
