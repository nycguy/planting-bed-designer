// Landscape plant reference list used for the planting design.
//
// Each entry carries the USDA hardiness zone range in which the plant is
// generally sold and expected to overwinter, and a typical mature spread in
// feet. These are nursery-catalog ranges, not guarantees: cultivar, soil,
// exposure, and microclimate move them. Spread is the diameter used to draw
// the plant's footprint on the map. Flowers and bulbs are placed as roughly
// 18-inch drifts regardless of the listed spread.
//
// Categories: 'tree' | 'shrub' | 'flower' (perennials, annual-style
// bedding plants, and bulbs). Sun: 'full' | 'part' | 'shade' | 'full-part' | 'part-shade'.
//
// The list favors plants common in Northeast and Mid-Atlantic residential
// landscapes (zones 4–8) but includes enough range to be useful elsewhere.

export const PLANTS = [
  // ---------------- TREES ----------------
  { id: 'acer-rubrum', category: 'tree', name: 'Red Maple', botanical: 'Acer rubrum', zoneMin: 3, zoneMax: 9, spreadFt: 40, heightFt: 50, sun: 'full-part', notes: 'Fast shade tree; brilliant fall color. Shallow roots.' },
  { id: 'acer-saccharum', category: 'tree', name: 'Sugar Maple', botanical: 'Acer saccharum', zoneMin: 3, zoneMax: 8, spreadFt: 40, heightFt: 60, sun: 'full-part', notes: 'Classic shade tree; dislikes salt and compacted soil.' },
  { id: 'acer-palmatum', category: 'tree', name: 'Japanese Maple', botanical: 'Acer palmatum', zoneMin: 5, zoneMax: 8, spreadFt: 15, heightFt: 15, sun: 'part', notes: 'Small ornamental; afternoon shade in hot sites.' },
  { id: 'acer-griseum', category: 'tree', name: 'Paperbark Maple', botanical: 'Acer griseum', zoneMin: 4, zoneMax: 8, spreadFt: 15, heightFt: 25, sun: 'full-part', notes: 'Peeling cinnamon bark; slow growing.' },
  { id: 'amelanchier', category: 'tree', name: 'Serviceberry', botanical: 'Amelanchier × grandiflora', zoneMin: 4, zoneMax: 9, spreadFt: 15, heightFt: 20, sun: 'full-part', notes: 'Native; white spring flowers, edible June berries, fall color.' },
  { id: 'betula-nigra', category: 'tree', name: 'River Birch', botanical: 'Betula nigra', zoneMin: 4, zoneMax: 9, spreadFt: 35, heightFt: 50, sun: 'full-part', notes: 'Tolerates wet soil; resists bronze birch borer. Often multi-stem.' },
  { id: 'carpinus-caroliniana', category: 'tree', name: 'American Hornbeam', botanical: 'Carpinus caroliniana', zoneMin: 3, zoneMax: 9, spreadFt: 25, heightFt: 25, sun: 'full-part', notes: 'Native understory tree; muscle-like bark.' },
  { id: 'cercis-canadensis', category: 'tree', name: 'Eastern Redbud', botanical: 'Cercis canadensis', zoneMin: 4, zoneMax: 9, spreadFt: 25, heightFt: 25, sun: 'full-part', notes: 'Native; pink flowers on bare branches in April.' },
  { id: 'chionanthus-virginicus', category: 'tree', name: 'White Fringetree', botanical: 'Chionanthus virginicus', zoneMin: 4, zoneMax: 9, spreadFt: 15, heightFt: 15, sun: 'full-part', notes: 'Native; fragrant fringe-like white flowers in late spring.' },
  { id: 'cornus-florida', category: 'tree', name: 'Flowering Dogwood', botanical: 'Cornus florida', zoneMin: 5, zoneMax: 9, spreadFt: 25, heightFt: 25, sun: 'part', notes: 'Native; prefers morning sun and afternoon shade. Anthracnose-prone in wet shade.' },
  { id: 'cornus-kousa', category: 'tree', name: 'Kousa Dogwood', botanical: 'Cornus kousa', zoneMin: 5, zoneMax: 8, spreadFt: 25, heightFt: 25, sun: 'full-part', notes: 'Blooms after leaves emerge; disease resistant; red fruit.' },
  { id: 'crataegus-viridis', category: 'tree', name: 'Winter King Hawthorn', botanical: 'Crataegus viridis \u2018Winter King\u2019', zoneMin: 4, zoneMax: 7, spreadFt: 25, heightFt: 25, sun: 'full', notes: 'Persistent red fruit; few thorns.' },
  { id: 'fagus-grandifolia', category: 'tree', name: 'American Beech', botanical: 'Fagus grandifolia', zoneMin: 3, zoneMax: 9, spreadFt: 50, heightFt: 60, sun: 'full-part', notes: 'Large native; needs room; smooth gray bark.' },
  { id: 'ginkgo-biloba', category: 'tree', name: 'Ginkgo (male)', botanical: 'Ginkgo biloba', zoneMin: 3, zoneMax: 8, spreadFt: 30, heightFt: 50, sun: 'full', notes: 'Tough street tree; plant male cultivars to avoid fruit.' },
  { id: 'gleditsia', category: 'tree', name: 'Thornless Honeylocust', botanical: 'Gleditsia triacanthos f. inermis', zoneMin: 3, zoneMax: 9, spreadFt: 40, heightFt: 50, sun: 'full', notes: 'Light, filtered shade; lawn grows beneath it.' },
  { id: 'halesia', category: 'tree', name: 'Carolina Silverbell', botanical: 'Halesia carolina', zoneMin: 4, zoneMax: 8, spreadFt: 25, heightFt: 30, sun: 'full-part', notes: 'Native; white bell flowers in spring.' },
  { id: 'ilex-opaca', category: 'tree', name: 'American Holly', botanical: 'Ilex opaca', zoneMin: 5, zoneMax: 9, spreadFt: 20, heightFt: 40, sun: 'full-part', notes: 'Native evergreen; needs a male nearby for berries.' },
  { id: 'juniperus-virginiana', category: 'tree', name: 'Eastern Red Cedar', botanical: 'Juniperus virginiana', zoneMin: 2, zoneMax: 9, spreadFt: 15, heightFt: 40, sun: 'full', notes: 'Native evergreen; drought tolerant; screening.' },
  { id: 'lagerstroemia', category: 'tree', name: 'Crape Myrtle', botanical: 'Lagerstroemia indica', zoneMin: 7, zoneMax: 9, spreadFt: 15, heightFt: 20, sun: 'full', notes: 'Summer flowers; hardy cultivars survive zone 6 with dieback.' },
  { id: 'liquidambar', category: 'tree', name: 'Sweetgum', botanical: 'Liquidambar styraciflua', zoneMin: 5, zoneMax: 9, spreadFt: 40, heightFt: 60, sun: 'full', notes: 'Star leaves, spiny fruit; choose fruitless cultivars near patios.' },
  { id: 'liriodendron', category: 'tree', name: 'Tulip Tree', botanical: 'Liriodendron tulipifera', zoneMin: 4, zoneMax: 9, spreadFt: 40, heightFt: 80, sun: 'full', notes: 'Very large native; fast; not for small lots.' },
  { id: 'magnolia-soulangeana', category: 'tree', name: 'Saucer Magnolia', botanical: 'Magnolia × soulangeana', zoneMin: 4, zoneMax: 9, spreadFt: 25, heightFt: 25, sun: 'full-part', notes: 'Large pink-white flowers in early spring; frost can brown blooms.' },
  { id: 'magnolia-stellata', category: 'tree', name: 'Star Magnolia', botanical: 'Magnolia stellata', zoneMin: 4, zoneMax: 8, spreadFt: 15, heightFt: 15, sun: 'full-part', notes: 'Compact; starry white flowers before leaves.' },
  { id: 'magnolia-virginiana', category: 'tree', name: 'Sweetbay Magnolia', botanical: 'Magnolia virginiana', zoneMin: 5, zoneMax: 10, spreadFt: 20, heightFt: 30, sun: 'full-part', notes: 'Native; tolerates wet soil; lemon-scented summer flowers.' },
  { id: 'malus', category: 'tree', name: 'Flowering Crabapple', botanical: 'Malus (disease-resistant cvs.)', zoneMin: 4, zoneMax: 8, spreadFt: 20, heightFt: 20, sun: 'full', notes: 'Choose scab-resistant cultivars such as \u2018Prairifire\u2019 or \u2018Donald Wyman\u2019.' },
  { id: 'nyssa-sylvatica', category: 'tree', name: 'Black Gum (Tupelo)', botanical: 'Nyssa sylvatica', zoneMin: 4, zoneMax: 9, spreadFt: 25, heightFt: 40, sun: 'full-part', notes: 'Native; outstanding scarlet fall color; slow.' },
  { id: 'oxydendrum', category: 'tree', name: 'Sourwood', botanical: 'Oxydendrum arboreum', zoneMin: 5, zoneMax: 9, spreadFt: 15, heightFt: 25, sun: 'full-part', notes: 'Native; summer flower panicles; acidic soil.' },
  { id: 'picea-abies', category: 'tree', name: 'Norway Spruce', botanical: 'Picea abies', zoneMin: 3, zoneMax: 7, spreadFt: 30, heightFt: 60, sun: 'full', notes: 'Fast evergreen screen; needs space.' },
  { id: 'picea-glauca-densata', category: 'tree', name: 'Black Hills Spruce', botanical: 'Picea glauca var. densata', zoneMin: 2, zoneMax: 6, spreadFt: 20, heightFt: 35, sun: 'full', notes: 'Dense, slow, cold hardy evergreen.' },
  { id: 'picea-pungens', category: 'tree', name: 'Colorado Blue Spruce', botanical: 'Picea pungens', zoneMin: 2, zoneMax: 7, spreadFt: 20, heightFt: 50, sun: 'full', notes: 'Struggles in humid zone 7+; needle cast common in the East.' },
  { id: 'pinus-strobus', category: 'tree', name: 'Eastern White Pine', botanical: 'Pinus strobus', zoneMin: 3, zoneMax: 8, spreadFt: 30, heightFt: 70, sun: 'full-part', notes: 'Native; soft needles; fast; salt sensitive.' },
  { id: 'platanus-acerifolia', category: 'tree', name: 'London Planetree', botanical: 'Platanus × acerifolia', zoneMin: 5, zoneMax: 9, spreadFt: 50, heightFt: 70, sun: 'full', notes: 'Huge urban tree; only for large properties.' },
  { id: 'prunus-serrulata', category: 'tree', name: 'Kwanzan Cherry', botanical: 'Prunus serrulata \u2018Kwanzan\u2019', zoneMin: 5, zoneMax: 8, spreadFt: 25, heightFt: 25, sun: 'full', notes: 'Double pink flowers; relatively short lived (20–30 years).' },
  { id: 'prunus-yedoensis', category: 'tree', name: 'Yoshino Cherry', botanical: 'Prunus × yedoensis', zoneMin: 5, zoneMax: 8, spreadFt: 30, heightFt: 30, sun: 'full', notes: 'The Washington DC cherry; pale pink to white.' },
  { id: 'quercus-alba', category: 'tree', name: 'White Oak', botanical: 'Quercus alba', zoneMin: 3, zoneMax: 9, spreadFt: 60, heightFt: 70, sun: 'full', notes: 'Long-lived native; the best wildlife tree; needs room.' },
  { id: 'quercus-bicolor', category: 'tree', name: 'Swamp White Oak', botanical: 'Quercus bicolor', zoneMin: 4, zoneMax: 8, spreadFt: 50, heightFt: 60, sun: 'full', notes: 'Native; tolerates wet and compacted soil; transplants well.' },
  { id: 'quercus-palustris', category: 'tree', name: 'Pin Oak', botanical: 'Quercus palustris', zoneMin: 4, zoneMax: 8, spreadFt: 40, heightFt: 60, sun: 'full', notes: 'Native; needs acidic soil; drooping lower branches.' },
  { id: 'quercus-rubra', category: 'tree', name: 'Northern Red Oak', botanical: 'Quercus rubra', zoneMin: 3, zoneMax: 8, spreadFt: 50, heightFt: 70, sun: 'full', notes: 'Fast for an oak; good street tree.' },
  { id: 'stewartia', category: 'tree', name: 'Japanese Stewartia', botanical: 'Stewartia pseudocamellia', zoneMin: 5, zoneMax: 8, spreadFt: 20, heightFt: 30, sun: 'part', notes: 'Camellia-like summer flowers; exfoliating bark; slow.' },
  { id: 'styrax-japonicus', category: 'tree', name: 'Japanese Snowbell', botanical: 'Styrax japonicus', zoneMin: 5, zoneMax: 8, spreadFt: 25, heightFt: 25, sun: 'full-part', notes: 'Hanging white bells in June; graceful.' },
  { id: 'syringa-reticulata', category: 'tree', name: 'Japanese Tree Lilac', botanical: 'Syringa reticulata', zoneMin: 3, zoneMax: 7, spreadFt: 20, heightFt: 25, sun: 'full', notes: 'Cream flower clusters in June; tough small tree.' },
  { id: 'thuja-green-giant', category: 'tree', name: 'Green Giant Arborvitae', botanical: 'Thuja \u2018Green Giant\u2019', zoneMin: 5, zoneMax: 8, spreadFt: 15, heightFt: 40, sun: 'full-part', notes: 'Fast evergreen screen (3 ft/yr); deer resistant compared with other arborvitae.' },
  { id: 'thuja-occidentalis', category: 'tree', name: 'Emerald Green Arborvitae', botanical: 'Thuja occidentalis \u2018Smaragd\u2019', zoneMin: 3, zoneMax: 7, spreadFt: 4, heightFt: 14, sun: 'full-part', notes: 'Narrow hedge plant; heavily browsed by deer.' },
  { id: 'tilia-cordata', category: 'tree', name: 'Littleleaf Linden', botanical: 'Tilia cordata', zoneMin: 3, zoneMax: 7, spreadFt: 35, heightFt: 60, sun: 'full', notes: 'Fragrant June flowers; aphids drip honeydew over parking.' },
  { id: 'tsuga-canadensis', category: 'tree', name: 'Eastern Hemlock', botanical: 'Tsuga canadensis', zoneMin: 3, zoneMax: 7, spreadFt: 30, heightFt: 60, sun: 'part-shade', notes: 'Native shade evergreen; hemlock woolly adelgid requires treatment in much of the East.' },
  { id: 'ulmus-princeton', category: 'tree', name: 'Princeton Elm', botanical: 'Ulmus americana \u2018Princeton\u2019', zoneMin: 3, zoneMax: 9, spreadFt: 50, heightFt: 60, sun: 'full', notes: 'Dutch elm disease tolerant American elm.' },
  { id: 'zelkova', category: 'tree', name: 'Japanese Zelkova', botanical: 'Zelkova serrata', zoneMin: 5, zoneMax: 8, spreadFt: 50, heightFt: 60, sun: 'full', notes: 'Vase-shaped elm substitute; tolerant of urban conditions.' },

  // ---------------- SHRUBS ----------------
  { id: 'abelia', category: 'shrub', name: 'Glossy Abelia', botanical: 'Abelia × grandiflora', zoneMin: 6, zoneMax: 9, spreadFt: 5, heightFt: 4, sun: 'full-part', notes: 'Long bloom, pollinator magnet; semi-evergreen in zone 6.' },
  { id: 'aronia', category: 'shrub', name: 'Black Chokeberry', botanical: 'Aronia melanocarpa', zoneMin: 3, zoneMax: 8, spreadFt: 5, heightFt: 5, sun: 'full-part', notes: 'Native; white flowers, black fruit, red fall color; tolerates wet.' },
  { id: 'azalea-evergreen', category: 'shrub', name: 'Evergreen Azalea', botanical: 'Rhododendron (Kurume/Girard hybrids)', zoneMin: 6, zoneMax: 9, spreadFt: 4, heightFt: 3, sun: 'part', notes: 'Acidic soil, morning sun; mulch shallow roots.' },
  { id: 'azalea-native', category: 'shrub', name: 'Pinxterbloom Azalea', botanical: 'Rhododendron periclymenoides', zoneMin: 4, zoneMax: 8, spreadFt: 5, heightFt: 5, sun: 'part', notes: 'Native deciduous azalea; fragrant pink spring flowers.' },
  { id: 'buxus', category: 'shrub', name: 'Boxwood', botanical: 'Buxus (\u2018Green Velvet\u2019, \u2018Winter Gem\u2019)', zoneMin: 5, zoneMax: 8, spreadFt: 3, heightFt: 3, sun: 'full-part', notes: 'Evergreen edging; boxwood blight and leafminer are regional concerns.' },
  { id: 'callicarpa', category: 'shrub', name: 'American Beautyberry', botanical: 'Callicarpa americana', zoneMin: 6, zoneMax: 10, spreadFt: 5, heightFt: 5, sun: 'full-part', notes: 'Native; violet berries in fall; cut back hard each spring.' },
  { id: 'calycanthus', category: 'shrub', name: 'Carolina Allspice', botanical: 'Calycanthus floridus', zoneMin: 4, zoneMax: 9, spreadFt: 8, heightFt: 8, sun: 'full-part', notes: 'Native; fruity-scented maroon flowers.' },
  { id: 'caryopteris', category: 'shrub', name: 'Bluebeard', botanical: 'Caryopteris × clandonensis', zoneMin: 5, zoneMax: 9, spreadFt: 3, heightFt: 3, sun: 'full', notes: 'Blue late-summer flowers; cut to 6 in. each spring.' },
  { id: 'cephalanthus', category: 'shrub', name: 'Buttonbush', botanical: 'Cephalanthus occidentalis', zoneMin: 5, zoneMax: 9, spreadFt: 6, heightFt: 8, sun: 'full-part', notes: 'Native; round white flowers; thrives in wet ground.' },
  { id: 'chaenomeles', category: 'shrub', name: 'Flowering Quince', botanical: 'Chaenomeles speciosa', zoneMin: 5, zoneMax: 9, spreadFt: 6, heightFt: 6, sun: 'full-part', notes: 'Very early coral or red flowers; thorny unless \u2018Double Take\u2019 series.' },
  { id: 'clethra', category: 'shrub', name: 'Summersweet', botanical: 'Clethra alnifolia', zoneMin: 4, zoneMax: 9, spreadFt: 5, heightFt: 6, sun: 'full-shade', notes: 'Native; fragrant July flowers; tolerates shade and wet.' },
  { id: 'cornus-sericea', category: 'shrub', name: 'Red-twig Dogwood', botanical: 'Cornus sericea', zoneMin: 3, zoneMax: 8, spreadFt: 8, heightFt: 8, sun: 'full-part', notes: 'Native; red winter stems; cut oldest stems yearly for color.' },
  { id: 'cotinus', category: 'shrub', name: 'Smokebush', botanical: 'Cotinus coggygria', zoneMin: 5, zoneMax: 8, spreadFt: 12, heightFt: 12, sun: 'full', notes: 'Purple-leaved cultivars; smoky flower plumes.' },
  { id: 'deutzia', category: 'shrub', name: 'Slender Deutzia', botanical: 'Deutzia gracilis \u2018Nikko\u2019', zoneMin: 5, zoneMax: 8, spreadFt: 4, heightFt: 2, sun: 'full-part', notes: 'Low mounding; white spring flowers.' },
  { id: 'fothergilla', category: 'shrub', name: 'Dwarf Fothergilla', botanical: 'Fothergilla gardenii', zoneMin: 5, zoneMax: 8, spreadFt: 3, heightFt: 3, sun: 'full-part', notes: 'Native; honey-scented bottlebrush flowers; orange fall color.' },
  { id: 'hamamelis', category: 'shrub', name: 'Witch Hazel', botanical: 'Hamamelis × intermedia', zoneMin: 5, zoneMax: 8, spreadFt: 12, heightFt: 12, sun: 'full-part', notes: 'Fragrant flowers in late winter; large.' },
  { id: 'hydrangea-arborescens', category: 'shrub', name: 'Smooth Hydrangea', botanical: 'Hydrangea arborescens \u2018Annabelle\u2019', zoneMin: 3, zoneMax: 9, spreadFt: 5, heightFt: 4, sun: 'part', notes: 'Native; big white heads on new wood; reliable in cold zones.' },
  { id: 'hydrangea-macrophylla', category: 'shrub', name: 'Bigleaf Hydrangea', botanical: 'Hydrangea macrophylla', zoneMin: 6, zoneMax: 9, spreadFt: 5, heightFt: 4, sun: 'part', notes: 'Blue in acidic soil, pink in alkaline; buds can freeze in zone 5–6.' },
  { id: 'hydrangea-paniculata', category: 'shrub', name: 'Panicle Hydrangea', botanical: 'Hydrangea paniculata (\u2018Limelight\u2019, \u2018Little Lime\u2019)', zoneMin: 3, zoneMax: 8, spreadFt: 6, heightFt: 6, sun: 'full-part', notes: 'Toughest hydrangea; blooms on new wood; dwarf forms 3–4 ft.' },
  { id: 'hydrangea-quercifolia', category: 'shrub', name: 'Oakleaf Hydrangea', botanical: 'Hydrangea quercifolia', zoneMin: 5, zoneMax: 9, spreadFt: 6, heightFt: 6, sun: 'part', notes: 'Native; peeling bark, burgundy fall color; tolerates dry shade.' },
  { id: 'ilex-glabra', category: 'shrub', name: 'Inkberry Holly', botanical: 'Ilex glabra (\u2018Shamrock\u2019)', zoneMin: 5, zoneMax: 9, spreadFt: 4, heightFt: 4, sun: 'full-part', notes: 'Native evergreen boxwood alternative; tolerates wet.' },
  { id: 'ilex-verticillata', category: 'shrub', name: 'Winterberry Holly', botanical: 'Ilex verticillata', zoneMin: 3, zoneMax: 9, spreadFt: 6, heightFt: 6, sun: 'full-part', notes: 'Native; red winter berries; needs one male per 5–6 females.' },
  { id: 'itea', category: 'shrub', name: 'Virginia Sweetspire', botanical: 'Itea virginica \u2018Henry\u2019s Garnet\u2019', zoneMin: 5, zoneMax: 9, spreadFt: 5, heightFt: 4, sun: 'full-shade', notes: 'Native; fragrant June flowers; garnet fall color; suckers.' },
  { id: 'juniperus-horizontalis', category: 'shrub', name: 'Creeping Juniper', botanical: 'Juniperus horizontalis', zoneMin: 3, zoneMax: 9, spreadFt: 6, heightFt: 1, sun: 'full', notes: 'Evergreen groundcover for slopes and hot dry sites.' },
  { id: 'kalmia', category: 'shrub', name: 'Mountain Laurel', botanical: 'Kalmia latifolia', zoneMin: 4, zoneMax: 9, spreadFt: 6, heightFt: 6, sun: 'part', notes: 'Native evergreen; acidic, well-drained soil; poisonous.' },
  { id: 'lindera', category: 'shrub', name: 'Spicebush', botanical: 'Lindera benzoin', zoneMin: 4, zoneMax: 9, spreadFt: 8, heightFt: 8, sun: 'part-shade', notes: 'Native; spicebush swallowtail host; yellow fall color.' },
  { id: 'microbiota', category: 'shrub', name: 'Siberian Cypress', botanical: 'Microbiota decussata', zoneMin: 3, zoneMax: 7, spreadFt: 8, heightFt: 1, sun: 'full-part', notes: 'Feathery evergreen groundcover; tolerates shade better than juniper.' },
  { id: 'myrica', category: 'shrub', name: 'Northern Bayberry', botanical: 'Morella pensylvanica', zoneMin: 3, zoneMax: 7, spreadFt: 8, heightFt: 8, sun: 'full-part', notes: 'Native; salt and drought tolerant; aromatic; waxy gray berries.' },
  { id: 'philadelphus', category: 'shrub', name: 'Mock Orange', botanical: 'Philadelphus coronarius', zoneMin: 4, zoneMax: 8, spreadFt: 8, heightFt: 8, sun: 'full-part', notes: 'Orange-blossom fragrance in June.' },
  { id: 'physocarpus', category: 'shrub', name: 'Ninebark', botanical: 'Physocarpus opulifolius', zoneMin: 3, zoneMax: 7, spreadFt: 6, heightFt: 6, sun: 'full-part', notes: 'Native; purple-leaved cultivars; very tough. Powdery mildew in humidity.' },
  { id: 'pieris', category: 'shrub', name: 'Japanese Pieris', botanical: 'Pieris japonica', zoneMin: 5, zoneMax: 8, spreadFt: 5, heightFt: 6, sun: 'part', notes: 'Evergreen; drooping white bells in April; lace bug in sun.' },
  { id: 'prunus-laurocerasus', category: 'shrub', name: 'Schip Laurel', botanical: 'Prunus laurocerasus \u2018Schipkaensis\u2019', zoneMin: 6, zoneMax: 9, spreadFt: 6, heightFt: 8, sun: 'full-shade', notes: 'Broadleaf evergreen screen; deer resistant.' },
  { id: 'rhododendron-catawbiense', category: 'shrub', name: 'Rhododendron (large-leaf)', botanical: 'Rhododendron catawbiense hybrids', zoneMin: 4, zoneMax: 8, spreadFt: 6, heightFt: 6, sun: 'part', notes: 'Acidic, well-drained soil; protect from winter sun and wind.' },
  { id: 'rhododendron-pjm', category: 'shrub', name: 'PJM Rhododendron', botanical: 'Rhododendron \u2018PJM\u2019', zoneMin: 4, zoneMax: 8, spreadFt: 4, heightFt: 4, sun: 'full-part', notes: 'Small-leaf, very cold hardy; lavender April flowers.' },
  { id: 'rhus-aromatica', category: 'shrub', name: 'Gro-Low Sumac', botanical: 'Rhus aromatica \u2018Gro-Low\u2019', zoneMin: 3, zoneMax: 9, spreadFt: 8, heightFt: 2, sun: 'full-part', notes: 'Native groundcover for slopes; orange-red fall color.' },
  { id: 'rosa-shrub', category: 'shrub', name: 'Shrub Rose', botanical: 'Rosa (Knock Out, Drift, Oso Easy)', zoneMin: 5, zoneMax: 9, spreadFt: 4, heightFt: 4, sun: 'full', notes: 'Repeat bloom, disease resistant; Drift series stays 2 ft.' },
  { id: 'sambucus', category: 'shrub', name: 'Black Lace Elderberry', botanical: 'Sambucus nigra \u2018Eva\u2019', zoneMin: 4, zoneMax: 7, spreadFt: 8, heightFt: 8, sun: 'full-part', notes: 'Purple lacy foliage, pink flowers; can be cut hard.' },
  { id: 'spiraea-japonica', category: 'shrub', name: 'Japanese Spirea', botanical: 'Spiraea japonica (\u2018Goldmound\u2019, \u2018Little Princess\u2019)', zoneMin: 4, zoneMax: 8, spreadFt: 3, heightFt: 3, sun: 'full', notes: 'Low, tough, pink summer flowers; invasive in some states.' },
  { id: 'syringa-meyeri', category: 'shrub', name: 'Dwarf Korean Lilac', botanical: 'Syringa meyeri \u2018Palibin\u2019', zoneMin: 3, zoneMax: 7, spreadFt: 6, heightFt: 5, sun: 'full', notes: 'Fragrant lavender flowers; mildew resistant.' },
  { id: 'syringa-vulgaris', category: 'shrub', name: 'Common Lilac', botanical: 'Syringa vulgaris', zoneMin: 3, zoneMax: 7, spreadFt: 10, heightFt: 12, sun: 'full', notes: 'Fragrant May flowers; needs cold winters to bloom well.' },
  { id: 'taxus', category: 'shrub', name: 'Yew (spreading)', botanical: 'Taxus × media \u2018Densiformis\u2019', zoneMin: 4, zoneMax: 7, spreadFt: 6, heightFt: 4, sun: 'full-shade', notes: 'Evergreen foundation plant; heavy deer browse; needs drainage.' },
  { id: 'vaccinium', category: 'shrub', name: 'Highbush Blueberry', botanical: 'Vaccinium corymbosum', zoneMin: 4, zoneMax: 7, spreadFt: 5, heightFt: 6, sun: 'full', notes: 'Native; edible fruit, red fall color; acidic soil (pH 4.5–5.5).' },
  { id: 'viburnum-carlesii', category: 'shrub', name: 'Koreanspice Viburnum', botanical: 'Viburnum carlesii', zoneMin: 4, zoneMax: 7, spreadFt: 6, heightFt: 6, sun: 'full-part', notes: 'Intensely fragrant pink-white flowers in April.' },
  { id: 'viburnum-dentatum', category: 'shrub', name: 'Arrowwood Viburnum', botanical: 'Viburnum dentatum', zoneMin: 3, zoneMax: 8, spreadFt: 8, heightFt: 8, sun: 'full-part', notes: 'Native; blue-black fruit for birds; tough screen.' },
  { id: 'viburnum-plicatum', category: 'shrub', name: 'Doublefile Viburnum', botanical: 'Viburnum plicatum f. tomentosum', zoneMin: 5, zoneMax: 8, spreadFt: 10, heightFt: 8, sun: 'full-part', notes: 'Horizontal branching lined with white flowers in May.' },
  { id: 'weigela', category: 'shrub', name: 'Weigela', botanical: 'Weigela florida (\u2018Wine & Roses\u2019, \u2018Spilled Wine\u2019)', zoneMin: 4, zoneMax: 8, spreadFt: 4, heightFt: 3, sun: 'full', notes: 'Purple foliage cultivars; pink trumpet flowers; hummingbirds.' },

  // ---------------- FLOWERS, PERENNIALS, BULBS ----------------
  { id: 'achillea', category: 'flower', name: 'Yarrow', botanical: 'Achillea millefolium', zoneMin: 3, zoneMax: 9, spreadFt: 2, heightFt: 2, sun: 'full', notes: 'Drought tolerant; flat flower heads; many colors.' },
  { id: 'agastache', category: 'flower', name: 'Anise Hyssop', botanical: 'Agastache foeniculum', zoneMin: 4, zoneMax: 9, spreadFt: 2, heightFt: 3, sun: 'full', notes: 'Native; licorice-scented; bees and goldfinches.' },
  { id: 'alchemilla', category: 'flower', name: 'Lady\u2019s Mantle', botanical: 'Alchemilla mollis', zoneMin: 3, zoneMax: 8, spreadFt: 2, heightFt: 1.5, sun: 'part', notes: 'Chartreuse sprays; scalloped leaves hold dew.' },
  { id: 'allium', category: 'flower', name: 'Ornamental Onion (bulb)', botanical: 'Allium \u2018Globemaster\u2019 / \u2018Purple Sensation\u2019', zoneMin: 4, zoneMax: 8, spreadFt: 1, heightFt: 3, sun: 'full', notes: 'Plant bulbs in fall; deer and rodent proof.' },
  { id: 'amsonia', category: 'flower', name: 'Bluestar', botanical: 'Amsonia hubrichtii', zoneMin: 5, zoneMax: 8, spreadFt: 3, heightFt: 3, sun: 'full-part', notes: 'Native; pale blue spring flowers; gold fall foliage.' },
  { id: 'anemone', category: 'flower', name: 'Japanese Anemone', botanical: 'Anemone × hybrida', zoneMin: 4, zoneMax: 8, spreadFt: 2, heightFt: 3, sun: 'part', notes: 'Fall flowers; spreads steadily.' },
  { id: 'aquilegia', category: 'flower', name: 'Columbine', botanical: 'Aquilegia canadensis', zoneMin: 3, zoneMax: 8, spreadFt: 1, heightFt: 2, sun: 'part', notes: 'Native; red-yellow spring flowers; self sows.' },
  { id: 'asclepias-tuberosa', category: 'flower', name: 'Butterfly Weed', botanical: 'Asclepias tuberosa', zoneMin: 3, zoneMax: 9, spreadFt: 1.5, heightFt: 2, sun: 'full', notes: 'Native; orange flowers; monarch host; slow to emerge in spring.' },
  { id: 'aster', category: 'flower', name: 'New England Aster', botanical: 'Symphyotrichum novae-angliae', zoneMin: 4, zoneMax: 8, spreadFt: 2, heightFt: 4, sun: 'full', notes: 'Native; purple fall flowers; pinch in June to keep compact.' },
  { id: 'astilbe', category: 'flower', name: 'Astilbe', botanical: 'Astilbe × arendsii', zoneMin: 4, zoneMax: 8, spreadFt: 2, heightFt: 2, sun: 'part-shade', notes: 'Feathery plumes; needs consistently moist soil.' },
  { id: 'baptisia', category: 'flower', name: 'False Indigo', botanical: 'Baptisia australis', zoneMin: 3, zoneMax: 9, spreadFt: 3, heightFt: 3, sun: 'full', notes: 'Native; blue pea flowers; shrub-like; do not move once established.' },
  { id: 'brunnera', category: 'flower', name: 'Siberian Bugloss', botanical: 'Brunnera macrophylla \u2018Jack Frost\u2019', zoneMin: 3, zoneMax: 8, spreadFt: 1.5, heightFt: 1, sun: 'part-shade', notes: 'Silver leaves; blue forget-me-not flowers.' },
  { id: 'calamagrostis', category: 'flower', name: 'Feather Reed Grass', botanical: 'Calamagrostis × acutiflora \u2018Karl Foerster\u2019', zoneMin: 4, zoneMax: 9, spreadFt: 2, heightFt: 4, sun: 'full', notes: 'Upright grass; vertical accent; cut back in late winter.' },
  { id: 'carex', category: 'flower', name: 'Pennsylvania Sedge', botanical: 'Carex pensylvanica', zoneMin: 3, zoneMax: 8, spreadFt: 1.5, heightFt: 0.7, sun: 'part-shade', notes: 'Native lawn alternative for dry shade.' },
  { id: 'chelone', category: 'flower', name: 'Turtlehead', botanical: 'Chelone lyonii', zoneMin: 3, zoneMax: 8, spreadFt: 2, heightFt: 3, sun: 'part', notes: 'Native; pink late-summer flowers; moist soil.' },
  { id: 'coreopsis', category: 'flower', name: 'Threadleaf Coreopsis', botanical: 'Coreopsis verticillata \u2018Zagreb\u2019', zoneMin: 4, zoneMax: 9, spreadFt: 1.5, heightFt: 1.5, sun: 'full', notes: 'Yellow all summer; drought tolerant.' },
  { id: 'crocus', category: 'flower', name: 'Crocus (bulb)', botanical: 'Crocus vernus / tommasinianus', zoneMin: 3, zoneMax: 8, spreadFt: 0.5, heightFt: 0.4, sun: 'full-part', notes: 'Earliest color; C. tommasinianus resists squirrels.' },
  { id: 'dicentra', category: 'flower', name: 'Bleeding Heart', botanical: 'Lamprocapnos spectabilis', zoneMin: 3, zoneMax: 9, spreadFt: 2.5, heightFt: 2.5, sun: 'part-shade', notes: 'Goes dormant in summer heat; pair with hosta or fern.' },
  { id: 'echinacea', category: 'flower', name: 'Purple Coneflower', botanical: 'Echinacea purpurea', zoneMin: 3, zoneMax: 9, spreadFt: 1.5, heightFt: 3, sun: 'full', notes: 'Native; leave seedheads for goldfinches.' },
  { id: 'eutrochium', category: 'flower', name: 'Joe-Pye Weed', botanical: 'Eutrochium dubium \u2018Little Joe\u2019', zoneMin: 4, zoneMax: 8, spreadFt: 3, heightFt: 4, sun: 'full-part', notes: 'Native; mauve late-summer flowers; butterflies.' },
  { id: 'geranium', category: 'flower', name: 'Hardy Geranium', botanical: 'Geranium \u2018Rozanne\u2019', zoneMin: 5, zoneMax: 8, spreadFt: 2.5, heightFt: 1.5, sun: 'full-part', notes: 'Blue flowers June to frost; sprawling filler.' },
  { id: 'hakonechloa', category: 'flower', name: 'Japanese Forest Grass', botanical: 'Hakonechloa macra \u2018Aureola\u2019', zoneMin: 5, zoneMax: 9, spreadFt: 2, heightFt: 1.5, sun: 'part-shade', notes: 'Cascading gold grass for shade; slow.' },
  { id: 'helleborus', category: 'flower', name: 'Hellebore (Lenten Rose)', botanical: 'Helleborus × hybridus', zoneMin: 4, zoneMax: 9, spreadFt: 2, heightFt: 1.5, sun: 'part-shade', notes: 'Evergreen; flowers February–April; deer proof.' },
  { id: 'hemerocallis', category: 'flower', name: 'Daylily', botanical: 'Hemerocallis (\u2018Stella de Oro\u2019, \u2018Happy Returns\u2019)', zoneMin: 3, zoneMax: 9, spreadFt: 2, heightFt: 1.5, sun: 'full-part', notes: 'Indestructible; reblooming dwarfs; deer eat buds.' },
  { id: 'heuchera', category: 'flower', name: 'Coral Bells', botanical: 'Heuchera hybrids', zoneMin: 4, zoneMax: 9, spreadFt: 1.5, heightFt: 1, sun: 'part', notes: 'Colored foliage (purple, caramel, lime); replant if crowns heave.' },
  { id: 'hosta', category: 'flower', name: 'Hosta', botanical: 'Hosta hybrids', zoneMin: 3, zoneMax: 9, spreadFt: 3, heightFt: 2, sun: 'part-shade', notes: 'Shade standard; slugs and deer; sizes from 8 in. to 4 ft.' },
  { id: 'hyacinthus', category: 'flower', name: 'Hyacinth (bulb)', botanical: 'Hyacinthus orientalis', zoneMin: 4, zoneMax: 8, spreadFt: 0.5, heightFt: 0.8, sun: 'full-part', notes: 'Intensely fragrant; declines after a few years.' },
  { id: 'iris-sibirica', category: 'flower', name: 'Siberian Iris', botanical: 'Iris sibirica', zoneMin: 3, zoneMax: 9, spreadFt: 2, heightFt: 3, sun: 'full-part', notes: 'Grassy foliage; tolerates wet; no borer problems.' },
  { id: 'lavandula', category: 'flower', name: 'Lavender', botanical: 'Lavandula angustifolia \u2018Hidcote\u2019 / \u2018Munstead\u2019', zoneMin: 5, zoneMax: 9, spreadFt: 2, heightFt: 1.5, sun: 'full', notes: 'Needs sharp drainage; rots in wet clay winters.' },
  { id: 'leucanthemum', category: 'flower', name: 'Shasta Daisy', botanical: 'Leucanthemum × superbum \u2018Becky\u2019', zoneMin: 5, zoneMax: 9, spreadFt: 2, heightFt: 3, sun: 'full', notes: 'Classic white daisy; divide every 3 years.' },
  { id: 'liatris', category: 'flower', name: 'Blazing Star', botanical: 'Liatris spicata', zoneMin: 3, zoneMax: 8, spreadFt: 1, heightFt: 3, sun: 'full', notes: 'Native; purple spikes; butterflies.' },
  { id: 'liriope', category: 'flower', name: 'Lilyturf', botanical: 'Liriope muscari', zoneMin: 6, zoneMax: 10, spreadFt: 1.5, heightFt: 1, sun: 'full-shade', notes: 'Grassy evergreen edging; purple spikes; avoid spreading L. spicata.' },
  { id: 'lobelia', category: 'flower', name: 'Cardinal Flower', botanical: 'Lobelia cardinalis', zoneMin: 3, zoneMax: 9, spreadFt: 1, heightFt: 3, sun: 'full-part', notes: 'Native; scarlet spikes; hummingbirds; moist soil.' },
  { id: 'monarda', category: 'flower', name: 'Bee Balm', botanical: 'Monarda didyma', zoneMin: 4, zoneMax: 9, spreadFt: 2, heightFt: 3, sun: 'full-part', notes: 'Native; red or purple; pick mildew-resistant cultivars.' },
  { id: 'muscari', category: 'flower', name: 'Grape Hyacinth (bulb)', botanical: 'Muscari armeniacum', zoneMin: 4, zoneMax: 8, spreadFt: 0.5, heightFt: 0.6, sun: 'full-part', notes: 'Blue April flowers; naturalizes freely.' },
  { id: 'narcissus', category: 'flower', name: 'Daffodil (bulb)', botanical: 'Narcissus', zoneMin: 3, zoneMax: 8, spreadFt: 0.7, heightFt: 1.3, sun: 'full-part', notes: 'Deer and rodent proof; plant in drifts in fall.' },
  { id: 'nepeta', category: 'flower', name: 'Catmint', botanical: 'Nepeta × faassenii \u2018Walker\u2019s Low\u2019', zoneMin: 4, zoneMax: 8, spreadFt: 3, heightFt: 2, sun: 'full', notes: 'Lavender-blue haze all summer; deer resistant; drought tolerant.' },
  { id: 'paeonia', category: 'flower', name: 'Peony', botanical: 'Paeonia lactiflora', zoneMin: 3, zoneMax: 8, spreadFt: 3, heightFt: 3, sun: 'full', notes: 'Lives for decades; plant eyes no deeper than 2 in.' },
  { id: 'panicum', category: 'flower', name: 'Switchgrass', botanical: 'Panicum virgatum \u2018Northwind\u2019 / \u2018Shenandoah\u2019', zoneMin: 4, zoneMax: 9, spreadFt: 2.5, heightFt: 5, sun: 'full', notes: 'Native grass; upright; airy seedheads.' },
  { id: 'pennisetum', category: 'flower', name: 'Dwarf Fountain Grass', botanical: 'Pennisetum alopecuroides \u2018Hameln\u2019', zoneMin: 5, zoneMax: 9, spreadFt: 2, heightFt: 2.5, sun: 'full', notes: 'Soft bottlebrush plumes; mounding.' },
  { id: 'perovskia', category: 'flower', name: 'Russian Sage', botanical: 'Salvia yangii (Perovskia)', zoneMin: 5, zoneMax: 9, spreadFt: 3, heightFt: 3, sun: 'full', notes: 'Silver stems, blue haze; needs drainage and full sun.' },
  { id: 'phlox-paniculata', category: 'flower', name: 'Garden Phlox', botanical: 'Phlox paniculata (\u2018David\u2019, \u2018Jeana\u2019)', zoneMin: 4, zoneMax: 8, spreadFt: 2, heightFt: 3, sun: 'full', notes: 'Fragrant summer flowers; choose mildew-resistant cultivars.' },
  { id: 'phlox-subulata', category: 'flower', name: 'Creeping Phlox', botanical: 'Phlox subulata', zoneMin: 3, zoneMax: 9, spreadFt: 2, heightFt: 0.5, sun: 'full', notes: 'Carpet of April flowers; edges and slopes.' },
  { id: 'polygonatum', category: 'flower', name: 'Solomon\u2019s Seal', botanical: 'Polygonatum odoratum \u2018Variegatum\u2019', zoneMin: 3, zoneMax: 8, spreadFt: 2, heightFt: 2, sun: 'part-shade', notes: 'Arching variegated stems; spreads slowly.' },
  { id: 'polystichum', category: 'flower', name: 'Christmas Fern', botanical: 'Polystichum acrostichoides', zoneMin: 3, zoneMax: 9, spreadFt: 2, heightFt: 1.5, sun: 'part-shade', notes: 'Native evergreen fern; dry shade.' },
  { id: 'pulmonaria', category: 'flower', name: 'Lungwort', botanical: 'Pulmonaria \u2018Raspberry Splash\u2019', zoneMin: 3, zoneMax: 8, spreadFt: 1.5, heightFt: 1, sun: 'part-shade', notes: 'Spotted leaves; early pink-blue flowers.' },
  { id: 'rudbeckia', category: 'flower', name: 'Black-eyed Susan', botanical: 'Rudbeckia fulgida \u2018Goldsturm\u2019', zoneMin: 3, zoneMax: 9, spreadFt: 2, heightFt: 2.5, sun: 'full', notes: 'Native; gold from July to frost; spreads.' },
  { id: 'salvia', category: 'flower', name: 'Meadow Sage', botanical: 'Salvia nemorosa \u2018May Night\u2019 / \u2018Caradonna\u2019', zoneMin: 4, zoneMax: 8, spreadFt: 1.5, heightFt: 2, sun: 'full', notes: 'Violet spikes; shear for rebloom; deer resistant.' },
  { id: 'schizachyrium', category: 'flower', name: 'Little Bluestem', botanical: 'Schizachyrium scoparium \u2018Standing Ovation\u2019', zoneMin: 3, zoneMax: 9, spreadFt: 1.5, heightFt: 3, sun: 'full', notes: 'Native grass; blue-green turning copper; lean soil.' },
  { id: 'sedum', category: 'flower', name: 'Upright Sedum', botanical: 'Hylotelephium \u2018Autumn Joy\u2019', zoneMin: 3, zoneMax: 9, spreadFt: 2, heightFt: 2, sun: 'full', notes: 'Succulent; pink-to-rust fall heads; drought tolerant.' },
  { id: 'solidago', category: 'flower', name: 'Dwarf Goldenrod', botanical: 'Solidago \u2018Fireworks\u2019 / \u2018Little Lemon\u2019', zoneMin: 4, zoneMax: 8, spreadFt: 2, heightFt: 2.5, sun: 'full', notes: 'Native; late-season gold; does not cause hay fever.' },
  { id: 'tiarella', category: 'flower', name: 'Foamflower', botanical: 'Tiarella cordifolia', zoneMin: 3, zoneMax: 8, spreadFt: 1.5, heightFt: 1, sun: 'part-shade', notes: 'Native groundcover; white spring spikes.' },
  { id: 'tulipa', category: 'flower', name: 'Tulip (bulb)', botanical: 'Tulipa (Darwin Hybrids)', zoneMin: 3, zoneMax: 8, spreadFt: 0.5, heightFt: 1.5, sun: 'full', notes: 'Treat as short-lived; deer and voles eat them. Darwin Hybrids persist longest.' },
  { id: 'veronica', category: 'flower', name: 'Spike Speedwell', botanical: 'Veronica spicata', zoneMin: 3, zoneMax: 8, spreadFt: 1.5, heightFt: 1.5, sun: 'full', notes: 'Blue spikes in June; deadhead to rebloom.' },
];

export const CATEGORIES = [
  { id: 'tree', label: 'Trees', singular: 'tree', color: '#1b5e20' },
  { id: 'shrub', label: 'Shrubs', singular: 'shrub', color: '#43a047' },
  { id: 'flower', label: 'Flowers & bulbs', singular: 'flower group', color: '#d81b60' },
];

export const plantById = (id) => PLANTS.find((p) => p.id === id) || null;
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

export function searchPlants({ category, zone, query }) {
  const q = (query || '').trim().toLowerCase();
  return PLANTS.filter((p) => p.category === category && suitableForZone(p, zone))
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
