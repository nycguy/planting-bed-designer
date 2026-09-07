// Landscape plant reference list used for the planting design.
//
// Each entry carries the USDA hardiness zone range in which the plant is
// generally sold and expected to overwinter, and a typical mature spread in
// feet. These are nursery-catalog ranges, not guarantees: cultivar, soil,
// exposure, and microclimate move them. Spread is the diameter used to draw
// the plant's footprint on the map. Flowers and bulbs are placed as roughly
// 18-inch drifts regardless of the listed spread.
//
// Categories: 'tree' | 'shrub' | 'grass' (ornamental grasses and sedges) |
// 'flower' (perennials, annual-style bedding plants, and bulbs). Sun: 'full' | 'part' | 'shade' | 'full-part' | 'part-shade'.
//
// The list favors plants common in Northeast and Mid-Atlantic residential
// landscapes (zones 4–8) but includes enough range to be useful elsewhere.

export const PLANTS = [
  // ---------------- TREES ----------------
  { id: 'acer-rubrum', category: 'tree', native: true, deerResistant: false, bloom: [3, 4], bloomColor: '#c0392b', name: 'Red Maple', botanical: 'Acer rubrum', zoneMin: 3, zoneMax: 9, spreadFt: 40, heightFt: 50, sun: 'full-part', notes: 'Fast shade tree; brilliant fall color. Shallow roots.' },
  { id: 'acer-saccharum', category: 'tree', native: true, deerResistant: false, bloom: [4, 4], bloomColor: '#c7d35c', name: 'Sugar Maple', botanical: 'Acer saccharum', zoneMin: 3, zoneMax: 8, spreadFt: 40, heightFt: 60, sun: 'full-part', notes: 'Classic shade tree; dislikes salt and compacted soil.' },
  { id: 'acer-palmatum', category: 'tree', native: false, deerResistant: false, name: 'Japanese Maple', botanical: 'Acer palmatum', zoneMin: 5, zoneMax: 8, spreadFt: 15, heightFt: 15, sun: 'part', notes: 'Small ornamental; afternoon shade in hot sites.' },
  { id: 'acer-griseum', category: 'tree', native: false, deerResistant: true, name: 'Paperbark Maple', botanical: 'Acer griseum', zoneMin: 4, zoneMax: 8, spreadFt: 15, heightFt: 25, sun: 'full-part', notes: 'Peeling cinnamon bark; slow growing.' },
  { id: 'amelanchier', category: 'tree', native: true, deerResistant: false, bloom: [4, 4], bloomColor: '#ffffff', name: 'Serviceberry', botanical: 'Amelanchier × grandiflora', zoneMin: 4, zoneMax: 9, spreadFt: 15, heightFt: 20, sun: 'full-part', notes: 'Native; white spring flowers, edible June berries, fall color.' },
  { id: 'betula-nigra', category: 'tree', native: true, deerResistant: true, name: 'River Birch', botanical: 'Betula nigra', zoneMin: 4, zoneMax: 9, spreadFt: 35, heightFt: 50, sun: 'full-part', notes: 'Tolerates wet soil; resists bronze birch borer. Often multi-stem.' },
  { id: 'carpinus-caroliniana', category: 'tree', native: true, deerResistant: false, name: 'American Hornbeam', botanical: 'Carpinus caroliniana', zoneMin: 3, zoneMax: 9, spreadFt: 25, heightFt: 25, sun: 'full-part', notes: 'Native understory tree; muscle-like bark.' },
  { id: 'cercis-canadensis', category: 'tree', native: true, deerResistant: false, bloom: [4, 4], bloomColor: '#e75480', name: 'Eastern Redbud', botanical: 'Cercis canadensis', zoneMin: 4, zoneMax: 9, spreadFt: 25, heightFt: 25, sun: 'full-part', notes: 'Native; pink flowers on bare branches in April.' },
  { id: 'chionanthus-virginicus', category: 'tree', native: true, deerResistant: false, bloom: [5, 6], bloomColor: '#ffffff', name: 'White Fringetree', botanical: 'Chionanthus virginicus', zoneMin: 4, zoneMax: 9, spreadFt: 15, heightFt: 15, sun: 'full-part', notes: 'Native; fragrant fringe-like white flowers in late spring.' },
  { id: 'cornus-florida', category: 'tree', native: true, deerResistant: false, bloom: [4, 5], bloomColor: '#ffffff', name: 'Flowering Dogwood', botanical: 'Cornus florida', zoneMin: 5, zoneMax: 9, spreadFt: 25, heightFt: 25, sun: 'part', notes: 'Native; prefers morning sun and afternoon shade. Anthracnose-prone in wet shade.' },
  { id: 'cornus-kousa', category: 'tree', native: false, deerResistant: true, bloom: [5, 6], bloomColor: '#ffffff', name: 'Kousa Dogwood', botanical: 'Cornus kousa', zoneMin: 5, zoneMax: 8, spreadFt: 25, heightFt: 25, sun: 'full-part', notes: 'Blooms after leaves emerge; disease resistant; red fruit.' },
  { id: 'crataegus-viridis', category: 'tree', native: false, deerResistant: true, bloom: [5, 5], bloomColor: '#ffffff', name: 'Winter King Hawthorn', botanical: 'Crataegus viridis \u2018Winter King\u2019', zoneMin: 4, zoneMax: 7, spreadFt: 25, heightFt: 25, sun: 'full', notes: 'Persistent red fruit; few thorns.' },
  { id: 'fagus-grandifolia', category: 'tree', native: true, deerResistant: false, name: 'American Beech', botanical: 'Fagus grandifolia', zoneMin: 3, zoneMax: 9, spreadFt: 50, heightFt: 60, sun: 'full-part', notes: 'Large native; needs room; smooth gray bark.' },
  { id: 'ginkgo-biloba', category: 'tree', native: false, deerResistant: true, name: 'Ginkgo (male)', botanical: 'Ginkgo biloba', zoneMin: 3, zoneMax: 8, spreadFt: 30, heightFt: 50, sun: 'full', notes: 'Tough street tree; plant male cultivars to avoid fruit.' },
  { id: 'gleditsia', category: 'tree', native: false, deerResistant: true, name: 'Thornless Honeylocust', botanical: 'Gleditsia triacanthos f. inermis', zoneMin: 3, zoneMax: 9, spreadFt: 40, heightFt: 50, sun: 'full', notes: 'Light, filtered shade; lawn grows beneath it.' },
  { id: 'halesia', category: 'tree', native: true, deerResistant: false, bloom: [4, 5], bloomColor: '#ffffff', name: 'Carolina Silverbell', botanical: 'Halesia carolina', zoneMin: 4, zoneMax: 8, spreadFt: 25, heightFt: 30, sun: 'full-part', notes: 'Native; white bell flowers in spring.' },
  { id: 'ilex-opaca', category: 'tree', native: true, deerResistant: true, name: 'American Holly', botanical: 'Ilex opaca', zoneMin: 5, zoneMax: 9, spreadFt: 20, heightFt: 40, sun: 'full-part', notes: 'Native evergreen; needs a male nearby for berries.' },
  { id: 'juniperus-virginiana', category: 'tree', native: true, deerResistant: true, name: 'Eastern Red Cedar', botanical: 'Juniperus virginiana', zoneMin: 2, zoneMax: 9, spreadFt: 15, heightFt: 40, sun: 'full', notes: 'Native evergreen; drought tolerant; screening.' },
  { id: 'lagerstroemia', category: 'tree', native: false, deerResistant: true, bloom: [7, 9], bloomColor: '#e91e63', name: 'Crape Myrtle', botanical: 'Lagerstroemia indica', zoneMin: 7, zoneMax: 9, spreadFt: 15, heightFt: 20, sun: 'full', notes: 'Summer flowers; hardy cultivars survive zone 6 with dieback.' },
  { id: 'liquidambar', category: 'tree', native: true, deerResistant: true, name: 'Sweetgum', botanical: 'Liquidambar styraciflua', zoneMin: 5, zoneMax: 9, spreadFt: 40, heightFt: 60, sun: 'full', notes: 'Star leaves, spiny fruit; choose fruitless cultivars near patios.' },
  { id: 'liriodendron', category: 'tree', native: true, deerResistant: false, bloom: [5, 6], bloomColor: '#f4d35e', name: 'Tulip Tree', botanical: 'Liriodendron tulipifera', zoneMin: 4, zoneMax: 9, spreadFt: 40, heightFt: 80, sun: 'full', notes: 'Very large native; fast; not for small lots.' },
  { id: 'magnolia-soulangeana', category: 'tree', native: false, deerResistant: true, bloom: [4, 4], bloomColor: '#f8bbd0', name: 'Saucer Magnolia', botanical: 'Magnolia × soulangeana', zoneMin: 4, zoneMax: 9, spreadFt: 25, heightFt: 25, sun: 'full-part', notes: 'Large pink-white flowers in early spring; frost can brown blooms.' },
  { id: 'magnolia-stellata', category: 'tree', native: false, deerResistant: true, bloom: [3, 4], bloomColor: '#ffffff', name: 'Star Magnolia', botanical: 'Magnolia stellata', zoneMin: 4, zoneMax: 8, spreadFt: 15, heightFt: 15, sun: 'full-part', notes: 'Compact; starry white flowers before leaves.' },
  { id: 'magnolia-virginiana', category: 'tree', native: true, deerResistant: true, bloom: [6, 7], bloomColor: '#ffffff', name: 'Sweetbay Magnolia', botanical: 'Magnolia virginiana', zoneMin: 5, zoneMax: 10, spreadFt: 20, heightFt: 30, sun: 'full-part', notes: 'Native; tolerates wet soil; lemon-scented summer flowers.' },
  { id: 'malus', category: 'tree', native: false, deerResistant: false, bloom: [4, 5], bloomColor: '#f48fb1', name: 'Flowering Crabapple', botanical: 'Malus (disease-resistant cvs.)', zoneMin: 4, zoneMax: 8, spreadFt: 20, heightFt: 20, sun: 'full', notes: 'Choose scab-resistant cultivars such as \u2018Prairifire\u2019 or \u2018Donald Wyman\u2019.' },
  { id: 'nyssa-sylvatica', category: 'tree', native: true, deerResistant: false, name: 'Black Gum (Tupelo)', botanical: 'Nyssa sylvatica', zoneMin: 4, zoneMax: 9, spreadFt: 25, heightFt: 40, sun: 'full-part', notes: 'Native; outstanding scarlet fall color; slow.' },
  { id: 'oxydendrum', category: 'tree', native: true, deerResistant: false, bloom: [6, 7], bloomColor: '#ffffff', name: 'Sourwood', botanical: 'Oxydendrum arboreum', zoneMin: 5, zoneMax: 9, spreadFt: 15, heightFt: 25, sun: 'full-part', notes: 'Native; summer flower panicles; acidic soil.' },
  { id: 'picea-abies', category: 'tree', native: false, deerResistant: true, name: 'Norway Spruce', botanical: 'Picea abies', zoneMin: 3, zoneMax: 7, spreadFt: 30, heightFt: 60, sun: 'full', notes: 'Fast evergreen screen; needs space.' },
  { id: 'picea-glauca-densata', category: 'tree', native: false, deerResistant: true, name: 'Black Hills Spruce', botanical: 'Picea glauca var. densata', zoneMin: 2, zoneMax: 6, spreadFt: 20, heightFt: 35, sun: 'full', notes: 'Dense, slow, cold hardy evergreen.' },
  { id: 'picea-pungens', category: 'tree', native: false, deerResistant: true, name: 'Colorado Blue Spruce', botanical: 'Picea pungens', zoneMin: 2, zoneMax: 7, spreadFt: 20, heightFt: 50, sun: 'full', notes: 'Struggles in humid zone 7+; needle cast common in the East.' },
  { id: 'pinus-strobus', category: 'tree', native: true, deerResistant: true, name: 'Eastern White Pine', botanical: 'Pinus strobus', zoneMin: 3, zoneMax: 8, spreadFt: 30, heightFt: 70, sun: 'full-part', notes: 'Native; soft needles; fast; salt sensitive.' },
  { id: 'platanus-acerifolia', category: 'tree', native: false, deerResistant: false, name: 'London Planetree', botanical: 'Platanus × acerifolia', zoneMin: 5, zoneMax: 9, spreadFt: 50, heightFt: 70, sun: 'full', notes: 'Huge urban tree; only for large properties.' },
  { id: 'prunus-serrulata', category: 'tree', native: false, deerResistant: false, bloom: [4, 5], bloomColor: '#f48fb1', name: 'Kwanzan Cherry', botanical: 'Prunus serrulata \u2018Kwanzan\u2019', zoneMin: 5, zoneMax: 8, spreadFt: 25, heightFt: 25, sun: 'full', notes: 'Double pink flowers; relatively short lived (20–30 years).' },
  { id: 'prunus-yedoensis', category: 'tree', native: false, deerResistant: false, bloom: [4, 4], bloomColor: '#fce4ec', name: 'Yoshino Cherry', botanical: 'Prunus × yedoensis', zoneMin: 5, zoneMax: 8, spreadFt: 30, heightFt: 30, sun: 'full', notes: 'The Washington DC cherry; pale pink to white.' },
  { id: 'quercus-alba', category: 'tree', native: true, deerResistant: false, name: 'White Oak', botanical: 'Quercus alba', zoneMin: 3, zoneMax: 9, spreadFt: 60, heightFt: 70, sun: 'full', notes: 'Long-lived native; the best wildlife tree; needs room.' },
  { id: 'quercus-bicolor', category: 'tree', native: true, deerResistant: false, name: 'Swamp White Oak', botanical: 'Quercus bicolor', zoneMin: 4, zoneMax: 8, spreadFt: 50, heightFt: 60, sun: 'full', notes: 'Native; tolerates wet and compacted soil; transplants well.' },
  { id: 'quercus-palustris', category: 'tree', native: true, deerResistant: false, name: 'Pin Oak', botanical: 'Quercus palustris', zoneMin: 4, zoneMax: 8, spreadFt: 40, heightFt: 60, sun: 'full', notes: 'Native; needs acidic soil; drooping lower branches.' },
  { id: 'quercus-rubra', category: 'tree', native: true, deerResistant: false, name: 'Northern Red Oak', botanical: 'Quercus rubra', zoneMin: 3, zoneMax: 8, spreadFt: 50, heightFt: 70, sun: 'full', notes: 'Fast for an oak; good street tree.' },
  { id: 'stewartia', category: 'tree', native: false, deerResistant: true, bloom: [6, 7], bloomColor: '#ffffff', name: 'Japanese Stewartia', botanical: 'Stewartia pseudocamellia', zoneMin: 5, zoneMax: 8, spreadFt: 20, heightFt: 30, sun: 'part', notes: 'Camellia-like summer flowers; exfoliating bark; slow.' },
  { id: 'styrax-japonicus', category: 'tree', native: false, deerResistant: true, bloom: [6, 6], bloomColor: '#ffffff', name: 'Japanese Snowbell', botanical: 'Styrax japonicus', zoneMin: 5, zoneMax: 8, spreadFt: 25, heightFt: 25, sun: 'full-part', notes: 'Hanging white bells in June; graceful.' },
  { id: 'syringa-reticulata', category: 'tree', native: false, deerResistant: true, bloom: [6, 6], bloomColor: '#fff8e1', name: 'Japanese Tree Lilac', botanical: 'Syringa reticulata', zoneMin: 3, zoneMax: 7, spreadFt: 20, heightFt: 25, sun: 'full', notes: 'Cream flower clusters in June; tough small tree.' },
  { id: 'thuja-green-giant', category: 'tree', native: false, deerResistant: true, name: 'Green Giant Arborvitae', botanical: 'Thuja \u2018Green Giant\u2019', zoneMin: 5, zoneMax: 8, spreadFt: 15, heightFt: 40, sun: 'full-part', notes: 'Fast evergreen screen (3 ft/yr); deer resistant compared with other arborvitae.' },
  { id: 'thuja-occidentalis', category: 'tree', native: false, deerResistant: false, name: 'Emerald Green Arborvitae', botanical: 'Thuja occidentalis \u2018Smaragd\u2019', zoneMin: 3, zoneMax: 7, spreadFt: 4, heightFt: 14, sun: 'full-part', notes: 'Narrow hedge plant; heavily browsed by deer.' },
  { id: 'tilia-cordata', category: 'tree', native: false, deerResistant: false, bloom: [6, 7], bloomColor: '#fff59d', name: 'Littleleaf Linden', botanical: 'Tilia cordata', zoneMin: 3, zoneMax: 7, spreadFt: 35, heightFt: 60, sun: 'full', notes: 'Fragrant June flowers; aphids drip honeydew over parking.' },
  { id: 'tsuga-canadensis', category: 'tree', native: true, deerResistant: false, name: 'Eastern Hemlock', botanical: 'Tsuga canadensis', zoneMin: 3, zoneMax: 7, spreadFt: 30, heightFt: 60, sun: 'part-shade', notes: 'Native shade evergreen; hemlock woolly adelgid requires treatment in much of the East.' },
  { id: 'ulmus-princeton', category: 'tree', native: true, deerResistant: false, name: 'Princeton Elm', botanical: 'Ulmus americana \u2018Princeton\u2019', zoneMin: 3, zoneMax: 9, spreadFt: 50, heightFt: 60, sun: 'full', notes: 'Dutch elm disease tolerant American elm.' },
  { id: 'zelkova', category: 'tree', native: false, deerResistant: true, name: 'Japanese Zelkova', botanical: 'Zelkova serrata', zoneMin: 5, zoneMax: 8, spreadFt: 50, heightFt: 60, sun: 'full', notes: 'Vase-shaped elm substitute; tolerant of urban conditions.' },

  // ---------------- SHRUBS ----------------
  { id: 'abelia', category: 'shrub', native: false, deerResistant: true, bloom: [6, 10], bloomColor: '#f8bbd0', name: 'Glossy Abelia', botanical: 'Abelia × grandiflora', zoneMin: 6, zoneMax: 9, spreadFt: 5, heightFt: 4, sun: 'full-part', notes: 'Long bloom, pollinator magnet; semi-evergreen in zone 6.' },
  { id: 'aronia', category: 'shrub', native: true, deerResistant: false, bloom: [5, 5], bloomColor: '#ffffff', name: 'Black Chokeberry', botanical: 'Aronia melanocarpa', zoneMin: 3, zoneMax: 8, spreadFt: 5, heightFt: 5, sun: 'full-part', notes: 'Native; white flowers, black fruit, red fall color; tolerates wet.' },
  { id: 'azalea-evergreen', category: 'shrub', native: false, deerResistant: false, bloom: [4, 5], bloomColor: '#e91e63', name: 'Evergreen Azalea', botanical: 'Rhododendron (Kurume/Girard hybrids)', zoneMin: 6, zoneMax: 9, spreadFt: 4, heightFt: 3, sun: 'part', notes: 'Acidic soil, morning sun; mulch shallow roots.' },
  { id: 'azalea-native', category: 'shrub', native: true, deerResistant: false, bloom: [4, 5], bloomColor: '#f48fb1', name: 'Pinxterbloom Azalea', botanical: 'Rhododendron periclymenoides', zoneMin: 4, zoneMax: 8, spreadFt: 5, heightFt: 5, sun: 'part', notes: 'Native deciduous azalea; fragrant pink spring flowers.' },
  { id: 'buxus', category: 'shrub', native: false, deerResistant: true, name: 'Boxwood', botanical: 'Buxus (\u2018Green Velvet\u2019, \u2018Winter Gem\u2019)', zoneMin: 5, zoneMax: 8, spreadFt: 3, heightFt: 3, sun: 'full-part', notes: 'Evergreen edging; boxwood blight and leafminer are regional concerns.' },
  { id: 'callicarpa', category: 'shrub', native: true, deerResistant: true, bloom: [6, 7], bloomColor: '#f8bbd0', name: 'American Beautyberry', botanical: 'Callicarpa americana', zoneMin: 6, zoneMax: 10, spreadFt: 5, heightFt: 5, sun: 'full-part', notes: 'Native; violet berries in fall; cut back hard each spring.' },
  { id: 'calycanthus', category: 'shrub', native: true, deerResistant: true, bloom: [5, 6], bloomColor: '#7b1e1e', name: 'Carolina Allspice', botanical: 'Calycanthus floridus', zoneMin: 4, zoneMax: 9, spreadFt: 8, heightFt: 8, sun: 'full-part', notes: 'Native; fruity-scented maroon flowers.' },
  { id: 'caryopteris', category: 'shrub', native: false, deerResistant: true, bloom: [8, 9], bloomColor: '#3f51b5', name: 'Bluebeard', botanical: 'Caryopteris × clandonensis', zoneMin: 5, zoneMax: 9, spreadFt: 3, heightFt: 3, sun: 'full', notes: 'Blue late-summer flowers; cut to 6 in. each spring.' },
  { id: 'cephalanthus', category: 'shrub', native: true, deerResistant: true, bloom: [6, 7], bloomColor: '#ffffff', name: 'Buttonbush', botanical: 'Cephalanthus occidentalis', zoneMin: 5, zoneMax: 9, spreadFt: 6, heightFt: 8, sun: 'full-part', notes: 'Native; round white flowers; thrives in wet ground.' },
  { id: 'chaenomeles', category: 'shrub', native: false, deerResistant: false, bloom: [3, 4], bloomColor: '#e53935', name: 'Flowering Quince', botanical: 'Chaenomeles speciosa', zoneMin: 5, zoneMax: 9, spreadFt: 6, heightFt: 6, sun: 'full-part', notes: 'Very early coral or red flowers; thorny unless \u2018Double Take\u2019 series.' },
  { id: 'clethra', category: 'shrub', native: true, deerResistant: true, bloom: [7, 8], bloomColor: '#ffffff', name: 'Summersweet', botanical: 'Clethra alnifolia', zoneMin: 4, zoneMax: 9, spreadFt: 5, heightFt: 6, sun: 'full-shade', notes: 'Native; fragrant July flowers; tolerates shade and wet.' },
  { id: 'cornus-sericea', category: 'shrub', native: true, deerResistant: false, bloom: [5, 6], bloomColor: '#ffffff', name: 'Red-twig Dogwood', botanical: 'Cornus sericea', zoneMin: 3, zoneMax: 8, spreadFt: 8, heightFt: 8, sun: 'full-part', notes: 'Native; red winter stems; cut oldest stems yearly for color.' },
  { id: 'cotinus', category: 'shrub', native: false, deerResistant: true, bloom: [6, 7], bloomColor: '#c48b9f', name: 'Smokebush', botanical: 'Cotinus coggygria', zoneMin: 5, zoneMax: 8, spreadFt: 12, heightFt: 12, sun: 'full', notes: 'Purple-leaved cultivars; smoky flower plumes.' },
  { id: 'deutzia', category: 'shrub', native: false, deerResistant: true, bloom: [5, 5], bloomColor: '#ffffff', name: 'Slender Deutzia', botanical: 'Deutzia gracilis \u2018Nikko\u2019', zoneMin: 5, zoneMax: 8, spreadFt: 4, heightFt: 2, sun: 'full-part', notes: 'Low mounding; white spring flowers.' },
  { id: 'fothergilla', category: 'shrub', native: true, deerResistant: true, bloom: [4, 5], bloomColor: '#ffffff', name: 'Dwarf Fothergilla', botanical: 'Fothergilla gardenii', zoneMin: 5, zoneMax: 8, spreadFt: 3, heightFt: 3, sun: 'full-part', notes: 'Native; honey-scented bottlebrush flowers; orange fall color.' },
  { id: 'hamamelis', category: 'shrub', native: false, deerResistant: true, bloom: [2, 3], bloomColor: '#ffb300', name: 'Witch Hazel', botanical: 'Hamamelis × intermedia', zoneMin: 5, zoneMax: 8, spreadFt: 12, heightFt: 12, sun: 'full-part', notes: 'Fragrant flowers in late winter; large.' },
  { id: 'hydrangea-arborescens', category: 'shrub', native: true, deerResistant: false, bloom: [6, 8], bloomColor: '#ffffff', name: 'Smooth Hydrangea', botanical: 'Hydrangea arborescens \u2018Annabelle\u2019', zoneMin: 3, zoneMax: 9, spreadFt: 5, heightFt: 4, sun: 'part', notes: 'Native; big white heads on new wood; reliable in cold zones.' },
  { id: 'hydrangea-macrophylla', category: 'shrub', native: false, deerResistant: false, bloom: [6, 8], bloomColor: '#5c6bc0', name: 'Bigleaf Hydrangea', botanical: 'Hydrangea macrophylla', zoneMin: 6, zoneMax: 9, spreadFt: 5, heightFt: 4, sun: 'part', notes: 'Blue in acidic soil, pink in alkaline; buds can freeze in zone 5–6.' },
  { id: 'hydrangea-paniculata', category: 'shrub', native: false, deerResistant: false, bloom: [7, 9], bloomColor: '#f1f8e9', name: 'Panicle Hydrangea', botanical: 'Hydrangea paniculata (\u2018Limelight\u2019, \u2018Little Lime\u2019)', zoneMin: 3, zoneMax: 8, spreadFt: 6, heightFt: 6, sun: 'full-part', notes: 'Toughest hydrangea; blooms on new wood; dwarf forms 3–4 ft.' },
  { id: 'hydrangea-quercifolia', category: 'shrub', native: true, deerResistant: false, bloom: [6, 7], bloomColor: '#ffffff', name: 'Oakleaf Hydrangea', botanical: 'Hydrangea quercifolia', zoneMin: 5, zoneMax: 9, spreadFt: 6, heightFt: 6, sun: 'part', notes: 'Native; peeling bark, burgundy fall color; tolerates dry shade.' },
  { id: 'ilex-glabra', category: 'shrub', native: true, deerResistant: true, name: 'Inkberry Holly', botanical: 'Ilex glabra (\u2018Shamrock\u2019)', zoneMin: 5, zoneMax: 9, spreadFt: 4, heightFt: 4, sun: 'full-part', notes: 'Native evergreen boxwood alternative; tolerates wet.' },
  { id: 'ilex-verticillata', category: 'shrub', native: true, deerResistant: false, name: 'Winterberry Holly', botanical: 'Ilex verticillata', zoneMin: 3, zoneMax: 9, spreadFt: 6, heightFt: 6, sun: 'full-part', notes: 'Native; red winter berries; needs one male per 5–6 females.' },
  { id: 'itea', category: 'shrub', native: true, deerResistant: true, bloom: [6, 6], bloomColor: '#ffffff', name: 'Virginia Sweetspire', botanical: 'Itea virginica \u2018Henry\u2019s Garnet\u2019', zoneMin: 5, zoneMax: 9, spreadFt: 5, heightFt: 4, sun: 'full-shade', notes: 'Native; fragrant June flowers; garnet fall color; suckers.' },
  { id: 'juniperus-horizontalis', category: 'shrub', native: true, deerResistant: true, name: 'Creeping Juniper', botanical: 'Juniperus horizontalis', zoneMin: 3, zoneMax: 9, spreadFt: 6, heightFt: 1, sun: 'full', notes: 'Evergreen groundcover for slopes and hot dry sites.' },
  { id: 'kalmia', category: 'shrub', native: true, deerResistant: true, bloom: [5, 6], bloomColor: '#f8bbd0', name: 'Mountain Laurel', botanical: 'Kalmia latifolia', zoneMin: 4, zoneMax: 9, spreadFt: 6, heightFt: 6, sun: 'part', notes: 'Native evergreen; acidic, well-drained soil; poisonous.' },
  { id: 'lindera', category: 'shrub', native: true, deerResistant: true, bloom: [3, 4], bloomColor: '#fdd835', name: 'Spicebush', botanical: 'Lindera benzoin', zoneMin: 4, zoneMax: 9, spreadFt: 8, heightFt: 8, sun: 'part-shade', notes: 'Native; spicebush swallowtail host; yellow fall color.' },
  { id: 'microbiota', category: 'shrub', native: false, deerResistant: true, name: 'Siberian Cypress', botanical: 'Microbiota decussata', zoneMin: 3, zoneMax: 7, spreadFt: 8, heightFt: 1, sun: 'full-part', notes: 'Feathery evergreen groundcover; tolerates shade better than juniper.' },
  { id: 'myrica', category: 'shrub', native: true, deerResistant: true, name: 'Northern Bayberry', botanical: 'Morella pensylvanica', zoneMin: 3, zoneMax: 7, spreadFt: 8, heightFt: 8, sun: 'full-part', notes: 'Native; salt and drought tolerant; aromatic; waxy gray berries.' },
  { id: 'philadelphus', category: 'shrub', native: false, deerResistant: true, bloom: [6, 6], bloomColor: '#ffffff', name: 'Mock Orange', botanical: 'Philadelphus coronarius', zoneMin: 4, zoneMax: 8, spreadFt: 8, heightFt: 8, sun: 'full-part', notes: 'Orange-blossom fragrance in June.' },
  { id: 'physocarpus', category: 'shrub', native: true, deerResistant: true, bloom: [5, 6], bloomColor: '#ffffff', name: 'Ninebark', botanical: 'Physocarpus opulifolius', zoneMin: 3, zoneMax: 7, spreadFt: 6, heightFt: 6, sun: 'full-part', notes: 'Native; purple-leaved cultivars; very tough. Powdery mildew in humidity.' },
  { id: 'pieris', category: 'shrub', native: false, deerResistant: true, bloom: [4, 4], bloomColor: '#ffffff', name: 'Japanese Pieris', botanical: 'Pieris japonica', zoneMin: 5, zoneMax: 8, spreadFt: 5, heightFt: 6, sun: 'part', notes: 'Evergreen; drooping white bells in April; lace bug in sun.' },
  { id: 'prunus-laurocerasus', category: 'shrub', native: false, deerResistant: true, bloom: [4, 5], bloomColor: '#ffffff', name: 'Schip Laurel', botanical: 'Prunus laurocerasus \u2018Schipkaensis\u2019', zoneMin: 6, zoneMax: 9, spreadFt: 6, heightFt: 8, sun: 'full-shade', notes: 'Broadleaf evergreen screen; deer resistant.' },
  { id: 'rhododendron-catawbiense', category: 'shrub', native: false, deerResistant: false, bloom: [5, 6], bloomColor: '#ab47bc', name: 'Rhododendron (large-leaf)', botanical: 'Rhododendron catawbiense hybrids', zoneMin: 4, zoneMax: 8, spreadFt: 6, heightFt: 6, sun: 'part', notes: 'Acidic, well-drained soil; protect from winter sun and wind.' },
  { id: 'rhododendron-pjm', category: 'shrub', native: false, deerResistant: true, bloom: [4, 4], bloomColor: '#ba68c8', name: 'PJM Rhododendron', botanical: 'Rhododendron \u2018PJM\u2019', zoneMin: 4, zoneMax: 8, spreadFt: 4, heightFt: 4, sun: 'full-part', notes: 'Small-leaf, very cold hardy; lavender April flowers.' },
  { id: 'rhus-aromatica', category: 'shrub', native: true, deerResistant: true, bloom: [4, 4], bloomColor: '#fdd835', name: 'Gro-Low Sumac', botanical: 'Rhus aromatica \u2018Gro-Low\u2019', zoneMin: 3, zoneMax: 9, spreadFt: 8, heightFt: 2, sun: 'full-part', notes: 'Native groundcover for slopes; orange-red fall color.' },
  { id: 'rosa-shrub', category: 'shrub', native: false, deerResistant: false, bloom: [5, 10], bloomColor: '#e53935', name: 'Shrub Rose', botanical: 'Rosa (Knock Out, Drift, Oso Easy)', zoneMin: 5, zoneMax: 9, spreadFt: 4, heightFt: 4, sun: 'full', notes: 'Repeat bloom, disease resistant; Drift series stays 2 ft.' },
  { id: 'sambucus', category: 'shrub', native: false, deerResistant: true, bloom: [6, 6], bloomColor: '#f8bbd0', name: 'Black Lace Elderberry', botanical: 'Sambucus nigra \u2018Eva\u2019', zoneMin: 4, zoneMax: 7, spreadFt: 8, heightFt: 8, sun: 'full-part', notes: 'Purple lacy foliage, pink flowers; can be cut hard.' },
  { id: 'spiraea-japonica', category: 'shrub', native: false, deerResistant: true, bloom: [6, 7], bloomColor: '#f06292', name: 'Japanese Spirea', botanical: 'Spiraea japonica (\u2018Goldmound\u2019, \u2018Little Princess\u2019)', zoneMin: 4, zoneMax: 8, spreadFt: 3, heightFt: 3, sun: 'full', notes: 'Low, tough, pink summer flowers; invasive in some states.' },
  { id: 'syringa-meyeri', category: 'shrub', native: false, deerResistant: true, bloom: [5, 5], bloomColor: '#ce93d8', name: 'Dwarf Korean Lilac', botanical: 'Syringa meyeri \u2018Palibin\u2019', zoneMin: 3, zoneMax: 7, spreadFt: 6, heightFt: 5, sun: 'full', notes: 'Fragrant lavender flowers; mildew resistant.' },
  { id: 'syringa-vulgaris', category: 'shrub', native: false, deerResistant: true, bloom: [5, 5], bloomColor: '#9575cd', name: 'Common Lilac', botanical: 'Syringa vulgaris', zoneMin: 3, zoneMax: 7, spreadFt: 10, heightFt: 12, sun: 'full', notes: 'Fragrant May flowers; needs cold winters to bloom well.' },
  { id: 'taxus', category: 'shrub', native: false, deerResistant: false, name: 'Yew (spreading)', botanical: 'Taxus × media \u2018Densiformis\u2019', zoneMin: 4, zoneMax: 7, spreadFt: 6, heightFt: 4, sun: 'full-shade', notes: 'Evergreen foundation plant; heavy deer browse; needs drainage.' },
  { id: 'vaccinium', category: 'shrub', native: true, deerResistant: false, bloom: [5, 5], bloomColor: '#ffffff', name: 'Highbush Blueberry', botanical: 'Vaccinium corymbosum', zoneMin: 4, zoneMax: 7, spreadFt: 5, heightFt: 6, sun: 'full', notes: 'Native; edible fruit, red fall color; acidic soil (pH 4.5–5.5).' },
  { id: 'viburnum-carlesii', category: 'shrub', native: false, deerResistant: true, bloom: [4, 5], bloomColor: '#ffffff', name: 'Koreanspice Viburnum', botanical: 'Viburnum carlesii', zoneMin: 4, zoneMax: 7, spreadFt: 6, heightFt: 6, sun: 'full-part', notes: 'Intensely fragrant pink-white flowers in April.' },
  { id: 'viburnum-dentatum', category: 'shrub', native: true, deerResistant: false, bloom: [5, 6], bloomColor: '#ffffff', name: 'Arrowwood Viburnum', botanical: 'Viburnum dentatum', zoneMin: 3, zoneMax: 8, spreadFt: 8, heightFt: 8, sun: 'full-part', notes: 'Native; blue-black fruit for birds; tough screen.' },
  { id: 'viburnum-plicatum', category: 'shrub', native: false, deerResistant: true, bloom: [5, 5], bloomColor: '#ffffff', name: 'Doublefile Viburnum', botanical: 'Viburnum plicatum f. tomentosum', zoneMin: 5, zoneMax: 8, spreadFt: 10, heightFt: 8, sun: 'full-part', notes: 'Horizontal branching lined with white flowers in May.' },
  { id: 'weigela', category: 'shrub', native: false, deerResistant: true, bloom: [5, 6], bloomColor: '#ec407a', name: 'Weigela', botanical: 'Weigela florida (\u2018Wine & Roses\u2019, \u2018Spilled Wine\u2019)', zoneMin: 4, zoneMax: 8, spreadFt: 4, heightFt: 3, sun: 'full', notes: 'Purple foliage cultivars; pink trumpet flowers; hummingbirds.' },

  // ---------------- FLOWERS, PERENNIALS, BULBS (grasses are category 'grass') ----------------
  { id: 'achillea', category: 'flower', native: true, deerResistant: true, bloom: [6, 8], bloomColor: '#fdd835', name: 'Yarrow', botanical: 'Achillea millefolium', zoneMin: 3, zoneMax: 9, spreadFt: 2, heightFt: 2, sun: 'full', notes: 'Drought tolerant; flat flower heads; many colors.' },
  { id: 'agastache', category: 'flower', native: true, deerResistant: true, bloom: [7, 9], bloomColor: '#7986cb', name: 'Anise Hyssop', botanical: 'Agastache foeniculum', zoneMin: 4, zoneMax: 9, spreadFt: 2, heightFt: 3, sun: 'full', notes: 'Native; licorice-scented; bees and goldfinches.' },
  { id: 'alchemilla', category: 'flower', native: false, deerResistant: true, bloom: [6, 7], bloomColor: '#c6e34a', name: 'Lady\u2019s Mantle', botanical: 'Alchemilla mollis', zoneMin: 3, zoneMax: 8, spreadFt: 2, heightFt: 1.5, sun: 'part', notes: 'Chartreuse sprays; scalloped leaves hold dew.' },
  { id: 'allium', category: 'flower', native: false, deerResistant: true, bloom: [5, 6], bloomColor: '#8e24aa', name: 'Ornamental Onion (bulb)', botanical: 'Allium \u2018Globemaster\u2019 / \u2018Purple Sensation\u2019', zoneMin: 4, zoneMax: 8, spreadFt: 1, heightFt: 3, sun: 'full', notes: 'Plant bulbs in fall; deer and rodent proof.' },
  { id: 'amsonia', category: 'flower', native: true, deerResistant: true, bloom: [5, 5], bloomColor: '#90caf9', name: 'Bluestar', botanical: 'Amsonia hubrichtii', zoneMin: 5, zoneMax: 8, spreadFt: 3, heightFt: 3, sun: 'full-part', notes: 'Native; pale blue spring flowers; gold fall foliage.' },
  { id: 'anemone', category: 'flower', native: false, deerResistant: true, bloom: [8, 10], bloomColor: '#f8bbd0', name: 'Japanese Anemone', botanical: 'Anemone × hybrida', zoneMin: 4, zoneMax: 8, spreadFt: 2, heightFt: 3, sun: 'part', notes: 'Fall flowers; spreads steadily.' },
  { id: 'aquilegia', category: 'flower', native: true, deerResistant: true, bloom: [4, 5], bloomColor: '#e53935', name: 'Columbine', botanical: 'Aquilegia canadensis', zoneMin: 3, zoneMax: 8, spreadFt: 1, heightFt: 2, sun: 'part', notes: 'Native; red-yellow spring flowers; self sows.' },
  { id: 'asclepias-tuberosa', category: 'flower', native: true, deerResistant: true, bloom: [6, 8], bloomColor: '#fb8c00', name: 'Butterfly Weed', botanical: 'Asclepias tuberosa', zoneMin: 3, zoneMax: 9, spreadFt: 1.5, heightFt: 2, sun: 'full', notes: 'Native; orange flowers; monarch host; slow to emerge in spring.' },
  { id: 'aster', category: 'flower', native: true, deerResistant: false, bloom: [9, 10], bloomColor: '#7e57c2', name: 'New England Aster', botanical: 'Symphyotrichum novae-angliae', zoneMin: 4, zoneMax: 8, spreadFt: 2, heightFt: 4, sun: 'full', notes: 'Native; purple fall flowers; pinch in June to keep compact.' },
  { id: 'astilbe', category: 'flower', native: false, deerResistant: true, bloom: [6, 7], bloomColor: '#f48fb1', name: 'Astilbe', botanical: 'Astilbe × arendsii', zoneMin: 4, zoneMax: 8, spreadFt: 2, heightFt: 2, sun: 'part-shade', notes: 'Feathery plumes; needs consistently moist soil.' },
  { id: 'baptisia', category: 'flower', native: true, deerResistant: true, bloom: [5, 6], bloomColor: '#3949ab', name: 'False Indigo', botanical: 'Baptisia australis', zoneMin: 3, zoneMax: 9, spreadFt: 3, heightFt: 3, sun: 'full', notes: 'Native; blue pea flowers; shrub-like; do not move once established.' },
  { id: 'brunnera', category: 'flower', native: false, deerResistant: true, bloom: [4, 5], bloomColor: '#64b5f6', name: 'Siberian Bugloss', botanical: 'Brunnera macrophylla \u2018Jack Frost\u2019', zoneMin: 3, zoneMax: 8, spreadFt: 1.5, heightFt: 1, sun: 'part-shade', notes: 'Silver leaves; blue forget-me-not flowers.' },
  { id: 'calamagrostis', category: 'grass', native: false, deerResistant: true, bloom: [6, 9], bloomColor: '#c9b78c', name: 'Feather Reed Grass', botanical: 'Calamagrostis × acutiflora \u2018Karl Foerster\u2019', zoneMin: 4, zoneMax: 9, spreadFt: 2, heightFt: 4, sun: 'full', notes: 'Upright grass; vertical accent; cut back in late winter.' },
  { id: 'carex', category: 'grass', native: true, deerResistant: true, name: 'Pennsylvania Sedge', botanical: 'Carex pensylvanica', zoneMin: 3, zoneMax: 8, spreadFt: 1.5, heightFt: 0.7, sun: 'part-shade', notes: 'Native lawn alternative for dry shade.' },
  { id: 'chelone', category: 'flower', native: true, deerResistant: false, bloom: [8, 9], bloomColor: '#f06292', name: 'Turtlehead', botanical: 'Chelone lyonii', zoneMin: 3, zoneMax: 8, spreadFt: 2, heightFt: 3, sun: 'part', notes: 'Native; pink late-summer flowers; moist soil.' },
  { id: 'coreopsis', category: 'flower', native: true, deerResistant: true, bloom: [6, 9], bloomColor: '#ffeb3b', name: 'Threadleaf Coreopsis', botanical: 'Coreopsis verticillata \u2018Zagreb\u2019', zoneMin: 4, zoneMax: 9, spreadFt: 1.5, heightFt: 1.5, sun: 'full', notes: 'Yellow all summer; drought tolerant.' },
  { id: 'crocus', category: 'flower', native: false, deerResistant: true, bloom: [3, 3], bloomColor: '#ab47bc', name: 'Crocus (bulb)', botanical: 'Crocus vernus / tommasinianus', zoneMin: 3, zoneMax: 8, spreadFt: 0.5, heightFt: 0.4, sun: 'full-part', notes: 'Earliest color; C. tommasinianus resists squirrels.' },
  { id: 'dicentra', category: 'flower', native: false, deerResistant: true, bloom: [4, 5], bloomColor: '#f06292', name: 'Bleeding Heart', botanical: 'Lamprocapnos spectabilis', zoneMin: 3, zoneMax: 9, spreadFt: 2.5, heightFt: 2.5, sun: 'part-shade', notes: 'Goes dormant in summer heat; pair with hosta or fern.' },
  { id: 'echinacea', category: 'flower', native: true, deerResistant: true, bloom: [7, 9], bloomColor: '#d81b60', name: 'Purple Coneflower', botanical: 'Echinacea purpurea', zoneMin: 3, zoneMax: 9, spreadFt: 1.5, heightFt: 3, sun: 'full', notes: 'Native; leave seedheads for goldfinches.' },
  { id: 'eutrochium', category: 'flower', native: true, deerResistant: true, bloom: [8, 9], bloomColor: '#ce93d8', name: 'Joe-Pye Weed', botanical: 'Eutrochium dubium \u2018Little Joe\u2019', zoneMin: 4, zoneMax: 8, spreadFt: 3, heightFt: 4, sun: 'full-part', notes: 'Native; mauve late-summer flowers; butterflies.' },
  { id: 'geranium', category: 'flower', native: false, deerResistant: true, bloom: [6, 10], bloomColor: '#5c6bc0', name: 'Hardy Geranium', botanical: 'Geranium \u2018Rozanne\u2019', zoneMin: 5, zoneMax: 8, spreadFt: 2.5, heightFt: 1.5, sun: 'full-part', notes: 'Blue flowers June to frost; sprawling filler.' },
  { id: 'hakonechloa', category: 'grass', native: false, deerResistant: true, name: 'Japanese Forest Grass', botanical: 'Hakonechloa macra \u2018Aureola\u2019', zoneMin: 5, zoneMax: 9, spreadFt: 2, heightFt: 1.5, sun: 'part-shade', notes: 'Cascading gold grass for shade; slow.' },
  { id: 'helleborus', category: 'flower', native: false, deerResistant: true, bloom: [2, 4], bloomColor: '#ad6a8a', name: 'Hellebore (Lenten Rose)', botanical: 'Helleborus × hybridus', zoneMin: 4, zoneMax: 9, spreadFt: 2, heightFt: 1.5, sun: 'part-shade', notes: 'Evergreen; flowers February–April; deer proof.' },
  { id: 'hemerocallis', category: 'flower', native: false, deerResistant: false, bloom: [6, 9], bloomColor: '#ffb300', name: 'Daylily', botanical: 'Hemerocallis (\u2018Stella de Oro\u2019, \u2018Happy Returns\u2019)', zoneMin: 3, zoneMax: 9, spreadFt: 2, heightFt: 1.5, sun: 'full-part', notes: 'Indestructible; reblooming dwarfs; deer eat buds.' },
  { id: 'heuchera', category: 'flower', native: false, deerResistant: false, bloom: [5, 7], bloomColor: '#f8bbd0', name: 'Coral Bells', botanical: 'Heuchera hybrids', zoneMin: 4, zoneMax: 9, spreadFt: 1.5, heightFt: 1, sun: 'part', notes: 'Colored foliage (purple, caramel, lime); replant if crowns heave.' },
  { id: 'hosta', category: 'flower', native: false, deerResistant: false, bloom: [7, 8], bloomColor: '#e1bee7', name: 'Hosta', botanical: 'Hosta hybrids', zoneMin: 3, zoneMax: 9, spreadFt: 3, heightFt: 2, sun: 'part-shade', notes: 'Shade standard; slugs and deer; sizes from 8 in. to 4 ft.' },
  { id: 'hyacinthus', category: 'flower', native: false, deerResistant: false, bloom: [4, 4], bloomColor: '#5e35b1', name: 'Hyacinth (bulb)', botanical: 'Hyacinthus orientalis', zoneMin: 4, zoneMax: 8, spreadFt: 0.5, heightFt: 0.8, sun: 'full-part', notes: 'Intensely fragrant; declines after a few years.' },
  { id: 'iris-sibirica', category: 'flower', native: false, deerResistant: true, bloom: [5, 6], bloomColor: '#3f51b5', name: 'Siberian Iris', botanical: 'Iris sibirica', zoneMin: 3, zoneMax: 9, spreadFt: 2, heightFt: 3, sun: 'full-part', notes: 'Grassy foliage; tolerates wet; no borer problems.' },
  { id: 'lavandula', category: 'flower', native: false, deerResistant: true, bloom: [6, 7], bloomColor: '#7e57c2', name: 'Lavender', botanical: 'Lavandula angustifolia \u2018Hidcote\u2019 / \u2018Munstead\u2019', zoneMin: 5, zoneMax: 9, spreadFt: 2, heightFt: 1.5, sun: 'full', notes: 'Needs sharp drainage; rots in wet clay winters.' },
  { id: 'leucanthemum', category: 'flower', native: false, deerResistant: true, bloom: [6, 8], bloomColor: '#ffffff', name: 'Shasta Daisy', botanical: 'Leucanthemum × superbum \u2018Becky\u2019', zoneMin: 5, zoneMax: 9, spreadFt: 2, heightFt: 3, sun: 'full', notes: 'Classic white daisy; divide every 3 years.' },
  { id: 'liatris', category: 'flower', native: true, deerResistant: true, bloom: [7, 8], bloomColor: '#8e24aa', name: 'Blazing Star', botanical: 'Liatris spicata', zoneMin: 3, zoneMax: 8, spreadFt: 1, heightFt: 3, sun: 'full', notes: 'Native; purple spikes; butterflies.' },
  { id: 'liriope', category: 'flower', native: false, deerResistant: true, bloom: [8, 9], bloomColor: '#9575cd', name: 'Lilyturf', botanical: 'Liriope muscari', zoneMin: 6, zoneMax: 10, spreadFt: 1.5, heightFt: 1, sun: 'full-shade', notes: 'Grassy evergreen edging; purple spikes; avoid spreading L. spicata.' },
  { id: 'lobelia', category: 'flower', native: true, deerResistant: true, bloom: [7, 9], bloomColor: '#d32f2f', name: 'Cardinal Flower', botanical: 'Lobelia cardinalis', zoneMin: 3, zoneMax: 9, spreadFt: 1, heightFt: 3, sun: 'full-part', notes: 'Native; scarlet spikes; hummingbirds; moist soil.' },
  { id: 'monarda', category: 'flower', native: true, deerResistant: true, bloom: [7, 8], bloomColor: '#e53935', name: 'Bee Balm', botanical: 'Monarda didyma', zoneMin: 4, zoneMax: 9, spreadFt: 2, heightFt: 3, sun: 'full-part', notes: 'Native; red or purple; pick mildew-resistant cultivars.' },
  { id: 'muscari', category: 'flower', native: false, deerResistant: true, bloom: [4, 4], bloomColor: '#3949ab', name: 'Grape Hyacinth (bulb)', botanical: 'Muscari armeniacum', zoneMin: 4, zoneMax: 8, spreadFt: 0.5, heightFt: 0.6, sun: 'full-part', notes: 'Blue April flowers; naturalizes freely.' },
  { id: 'narcissus', category: 'flower', native: false, deerResistant: true, bloom: [3, 4], bloomColor: '#ffeb3b', name: 'Daffodil (bulb)', botanical: 'Narcissus', zoneMin: 3, zoneMax: 8, spreadFt: 0.7, heightFt: 1.3, sun: 'full-part', notes: 'Deer and rodent proof; plant in drifts in fall.' },
  { id: 'nepeta', category: 'flower', native: false, deerResistant: true, bloom: [5, 9], bloomColor: '#9fa8da', name: 'Catmint', botanical: 'Nepeta × faassenii \u2018Walker\u2019s Low\u2019', zoneMin: 4, zoneMax: 8, spreadFt: 3, heightFt: 2, sun: 'full', notes: 'Lavender-blue haze all summer; deer resistant; drought tolerant.' },
  { id: 'paeonia', category: 'flower', native: false, deerResistant: true, bloom: [5, 6], bloomColor: '#f48fb1', name: 'Peony', botanical: 'Paeonia lactiflora', zoneMin: 3, zoneMax: 8, spreadFt: 3, heightFt: 3, sun: 'full', notes: 'Lives for decades; plant eyes no deeper than 2 in.' },
  { id: 'panicum', category: 'grass', native: true, deerResistant: true, bloom: [8, 10], bloomColor: '#c9b78c', name: 'Switchgrass', botanical: 'Panicum virgatum \u2018Northwind\u2019 / \u2018Shenandoah\u2019', zoneMin: 4, zoneMax: 9, spreadFt: 2.5, heightFt: 5, sun: 'full', notes: 'Native grass; upright; airy seedheads.' },
  { id: 'pennisetum', category: 'grass', native: false, deerResistant: true, bloom: [8, 10], bloomColor: '#d7ccc8', name: 'Dwarf Fountain Grass', botanical: 'Pennisetum alopecuroides \u2018Hameln\u2019', zoneMin: 5, zoneMax: 9, spreadFt: 2, heightFt: 2.5, sun: 'full', notes: 'Soft bottlebrush plumes; mounding.' },
  { id: 'perovskia', category: 'flower', native: false, deerResistant: true, bloom: [7, 9], bloomColor: '#7986cb', name: 'Russian Sage', botanical: 'Salvia yangii (Perovskia)', zoneMin: 5, zoneMax: 9, spreadFt: 3, heightFt: 3, sun: 'full', notes: 'Silver stems, blue haze; needs drainage and full sun.' },
  { id: 'phlox-paniculata', category: 'flower', native: true, deerResistant: false, bloom: [7, 9], bloomColor: '#f06292', name: 'Garden Phlox', botanical: 'Phlox paniculata (\u2018David\u2019, \u2018Jeana\u2019)', zoneMin: 4, zoneMax: 8, spreadFt: 2, heightFt: 3, sun: 'full', notes: 'Fragrant summer flowers; choose mildew-resistant cultivars.' },
  { id: 'phlox-subulata', category: 'flower', native: true, deerResistant: false, bloom: [4, 5], bloomColor: '#f48fb1', name: 'Creeping Phlox', botanical: 'Phlox subulata', zoneMin: 3, zoneMax: 9, spreadFt: 2, heightFt: 0.5, sun: 'full', notes: 'Carpet of April flowers; edges and slopes.' },
  { id: 'polygonatum', category: 'flower', native: false, deerResistant: true, bloom: [5, 5], bloomColor: '#ffffff', name: 'Solomon\u2019s Seal', botanical: 'Polygonatum odoratum \u2018Variegatum\u2019', zoneMin: 3, zoneMax: 8, spreadFt: 2, heightFt: 2, sun: 'part-shade', notes: 'Arching variegated stems; spreads slowly.' },
  { id: 'polystichum', category: 'flower', native: true, deerResistant: true, name: 'Christmas Fern', botanical: 'Polystichum acrostichoides', zoneMin: 3, zoneMax: 9, spreadFt: 2, heightFt: 1.5, sun: 'part-shade', notes: 'Native evergreen fern; dry shade.' },
  { id: 'pulmonaria', category: 'flower', native: false, deerResistant: true, bloom: [4, 4], bloomColor: '#5c6bc0', name: 'Lungwort', botanical: 'Pulmonaria \u2018Raspberry Splash\u2019', zoneMin: 3, zoneMax: 8, spreadFt: 1.5, heightFt: 1, sun: 'part-shade', notes: 'Spotted leaves; early pink-blue flowers.' },
  { id: 'rudbeckia', category: 'flower', native: true, deerResistant: true, bloom: [7, 9], bloomColor: '#ffb300', name: 'Black-eyed Susan', botanical: 'Rudbeckia fulgida \u2018Goldsturm\u2019', zoneMin: 3, zoneMax: 9, spreadFt: 2, heightFt: 2.5, sun: 'full', notes: 'Native; gold from July to frost; spreads.' },
  { id: 'salvia', category: 'flower', native: false, deerResistant: true, bloom: [6, 7], bloomColor: '#5e35b1', name: 'Meadow Sage', botanical: 'Salvia nemorosa \u2018May Night\u2019 / \u2018Caradonna\u2019', zoneMin: 4, zoneMax: 8, spreadFt: 1.5, heightFt: 2, sun: 'full', notes: 'Violet spikes; shear for rebloom; deer resistant.' },
  { id: 'schizachyrium', category: 'grass', native: true, deerResistant: true, bloom: [8, 9], bloomColor: '#c9b78c', name: 'Little Bluestem', botanical: 'Schizachyrium scoparium \u2018Standing Ovation\u2019', zoneMin: 3, zoneMax: 9, spreadFt: 1.5, heightFt: 3, sun: 'full', notes: 'Native grass; blue-green turning copper; lean soil.' },
  { id: 'sedum', category: 'flower', native: false, deerResistant: true, bloom: [8, 10], bloomColor: '#e57373', name: 'Upright Sedum', botanical: 'Hylotelephium \u2018Autumn Joy\u2019', zoneMin: 3, zoneMax: 9, spreadFt: 2, heightFt: 2, sun: 'full', notes: 'Succulent; pink-to-rust fall heads; drought tolerant.' },
  { id: 'solidago', category: 'flower', native: true, deerResistant: true, bloom: [8, 9], bloomColor: '#fdd835', name: 'Dwarf Goldenrod', botanical: 'Solidago \u2018Fireworks\u2019 / \u2018Little Lemon\u2019', zoneMin: 4, zoneMax: 8, spreadFt: 2, heightFt: 2.5, sun: 'full', notes: 'Native; late-season gold; does not cause hay fever.' },
  { id: 'tiarella', category: 'flower', native: true, deerResistant: true, bloom: [4, 5], bloomColor: '#ffffff', name: 'Foamflower', botanical: 'Tiarella cordifolia', zoneMin: 3, zoneMax: 8, spreadFt: 1.5, heightFt: 1, sun: 'part-shade', notes: 'Native groundcover; white spring spikes.' },
  { id: 'tulipa', category: 'flower', native: false, deerResistant: false, bloom: [4, 5], bloomColor: '#e53935', name: 'Tulip (bulb)', botanical: 'Tulipa (Darwin Hybrids)', zoneMin: 3, zoneMax: 8, spreadFt: 0.5, heightFt: 1.5, sun: 'full', notes: 'Treat as short-lived; deer and voles eat them. Darwin Hybrids persist longest.' },
  { id: 'veronica', category: 'flower', native: false, deerResistant: true, bloom: [6, 7], bloomColor: '#3f51b5', name: 'Spike Speedwell', botanical: 'Veronica spicata', zoneMin: 3, zoneMax: 8, spreadFt: 1.5, heightFt: 1.5, sun: 'full', notes: 'Blue spikes in June; deadhead to rebloom.' },
];

// Things already in the yard. They draw in gray so the new design reads
// against them. Spread is set per instance when placed.
export const EXISTING = [
  { id: 'existing-tree', category: 'existing', name: 'Existing tree', botanical: 'Canopy already on site', zoneMin: 1, zoneMax: 13, spreadFt: 25, heightFt: 30, sun: 'full-shade', notes: 'Set the canopy width to match what is there. Beds under it are shaded.', native: false, deerResistant: true },
  { id: 'existing-shrub', category: 'existing', name: 'Existing shrub', botanical: 'Shrub already on site', zoneMin: 1, zoneMax: 13, spreadFt: 5, heightFt: 5, sun: 'full-shade', notes: 'A shrub you are keeping.', native: false, deerResistant: true },
  { id: 'existing-feature', category: 'existing', name: 'Structure or hardscape', botanical: 'Wall, walkway, patio, AC unit…', zoneMin: 1, zoneMax: 13, spreadFt: 4, heightFt: 0, sun: 'full-shade', notes: 'Set the width to roughly cover the feature. Keep plants clear of it.', native: false, deerResistant: true },
];

export const CATEGORIES = [
  { id: 'tree', label: 'Trees', singular: 'tree', color: '#1b5e20' },
  { id: 'shrub', label: 'Shrubs', singular: 'shrub', color: '#43a047' },
  { id: 'grass', label: 'Grasses', singular: 'grass', color: '#c9a227' },
  { id: 'flower', label: 'Flowers', singular: 'flower group', color: '#d81b60' },
  { id: 'existing', label: 'Existing', singular: 'existing feature', color: '#6d6d6d' },
];

export const ALL_ITEMS = [...PLANTS, ...EXISTING];
export const plantById = (id) => ALL_ITEMS.find((p) => p.id === id) || null;

// Years a plant typically needs to reach the listed mature spread. Used
// by the maturity slider; linear growth is close enough for a sketch.
export const YEARS_TO_MATURE = { tree: 15, shrub: 7, grass: 3, flower: 3, existing: 0 };

export const SUN_OPTIONS = [
  { id: 'full', label: 'Full sun', hint: '6+ hours of direct sun' },
  { id: 'part', label: 'Part sun', hint: '3–6 hours, or dappled light' },
  { id: 'shade', label: 'Shade', hint: 'Under 3 hours of direct sun' },
];

// Which bed exposures a plant's light code accepts.
const SUN_ACCEPTS = {
  full: ['full'],
  part: ['part'],
  shade: ['shade'],
  'full-part': ['full', 'part'],
  'part-shade': ['part', 'shade'],
  'full-shade': ['full', 'part', 'shade'],
};
export function sunCompatible(plant, bedSun) {
  if (!bedSun || !plant?.sun) return true;
  return (SUN_ACCEPTS[plant.sun] || []).includes(bedSun);
}

// Footprint area in square feet as drawn on the map.
export function footprintSqFt(plant, spreadOverrideFt) {
  if (!plant) return 0;
  if (plant.category === 'flower') return Math.PI * 0.75 * 0.75; // 18 in. drift
  const d = spreadOverrideFt || plant.spreadFt;
  return Math.PI * (d / 2) * (d / 2);
}

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const categoryById = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];

// Zone strings look like "7a". The numeric part is what plant ranges use.
export function zoneNumber(zone) {
  const m = String(zone || '').match(/(\d{1,2})/);
  return m ? Number(m[1]) : null;
}

export function suitableForZone(plant, zone) {
  const z = zoneNumber(zone);
  if (z == null) return true;
  return plant.zoneMin <= z && z <= plant.zoneMax;
}

export function searchPlants({ category, zone, query, sun = null, nativeOnly = false, deerOnly = false }) {
  const q = (query || '').trim().toLowerCase();
  if (category === 'existing') return EXISTING.slice();
  return PLANTS.filter((p) => p.category === category && suitableForZone(p, zone))
    .filter((p) => sunCompatible(p, sun))
    .filter((p) => !nativeOnly || p.native)
    .filter((p) => !deerOnly || p.deerResistant)
    .filter((p) => !q || p.name.toLowerCase().includes(q) || p.botanical.toLowerCase().includes(q) || (p.notes || '').toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export const SUN_LABELS = {
  full: 'Full sun',
  part: 'Part sun / part shade',
  shade: 'Shade',
  'full-part': 'Full sun to part shade',
  'part-shade': 'Part shade to shade',
  'full-shade': 'Sun or shade',
};
