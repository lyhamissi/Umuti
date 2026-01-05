import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Button } from "../components/ui/button";
import { Globe } from "lucide-react";
import { useState, createContext, useContext } from "react";
import type { ReactNode } from "react";
type Language = "en" | "rw" | "fr";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navbar
    home: "Home",
    findMedicine: "Find Medicine",
    about: "About",
    login: "Login",
    getStarted: "Get Started",
    search: "Search",
    english: "English",
    kinyarwanda: "Kinyarwanda",
    french: "French",
    
    // Hero Section
    heroTag: "Rwanda's #1 Medicine Finder",
    heroTitle: "Find Your Medicine at the",
    heroTitleHighlight: "Nearest Pharmacy",
    heroDescription: "Search for any medicine and discover which pharmacies near you have it in stock. Save time, stay healthy.",
    searchPlaceholder: "Search for medicine (e.g., Paracetamol)",
    medicinesListed: "Medicines Listed",
    pharmacies: "Pharmacies",
    happyUsers: "Happy Users",
    
    // Features
    whyChoose: "Why Choose",
    whyChooseDescription: "We connect you with verified pharmacies across Rwanda, making it easy to find the medicine you need.",
    searchMedicine: "Search Medicine",
    searchMedicineDesc: "Find any medicine instantly with our powerful search",
    nearbyPharmacies: "Nearby Pharmacies",
    nearbyPharmaciesDesc: "Discover pharmacies closest to you with stock available",
    realTimeStock: "Real-time Stock",
    realTimeStockDesc: "Get accurate, up-to-date inventory information",
    verifiedPharmacies: "Verified Pharmacies",
    verifiedPharmaciesDesc: "All pharmacies are licensed and verified",
    
    // CTA
    pharmacyOwner: "Are You a Pharmacy Owner?",
    pharmacyOwnerDesc: "Join UMUTI to increase your visibility and reach more customers. Manage your inventory easily and grow your business.",
    registerPharmacy: "Register Your Pharmacy",
    loginDashboard: "Login to Dashboard",
    
    // Footer
    footerDescription: "Find your medicine at the nearest pharmacy. Quick, easy, and reliable.",
    quickLinks: "Quick Links",
    forPharmacies: "For Pharmacies",
    contact: "Contact",
    allRightsReserved: "All rights reserved.",
    
    // About Page
    howToUse: "How to Use",
    aboutDescription: "Whether you're looking for medicine or managing a pharmacy, UMUTI makes it simple.",
    forUsers: "For Users",
    forUsersDesc: "Find the medicine you need at a pharmacy near you in just a few simple steps.",
    forPharmacists: "For Pharmacists",
    forPharmacistsDesc: "Manage your pharmacy's inventory and reach more customers through UMUTI.",
    step1User: "Search for your medicine",
    step1UserDesc: "Type the name of the medicine you're looking for in the search bar.",
    step2User: "View nearby pharmacies",
    step2UserDesc: "See a list of pharmacies that have the medicine in stock, sorted by distance.",
    step3User: "Get directions",
    step3UserDesc: "Click on a pharmacy to see its location and get directions to pick up your medicine.",
    step1Pharmacist: "Register your pharmacy",
    step1PharmacistDesc: "Create an account and submit your pharmacy details for verification.",
    step2Pharmacist: "Add your medicines",
    step2PharmacistDesc: "Use the dashboard to add medicines, set prices, and manage stock levels.",
    step3Pharmacist: "Grow your business",
    step3PharmacistDesc: "Customers will find your pharmacy when searching for medicines you have in stock.",
    
    // Medicine Management
    medicines: "Medicines",
    manageInventory: "Manage your pharmacy inventory",
    addMedicine: "Add Medicine",
    editMedicine: "Edit Medicine",
    addNewMedicine: "Add New Medicine",
    medicineName: "Medicine Name",
    medicineNamePlaceholder: "e.g., Paracetamol 500mg",
    category: "Category",
    categoryPlaceholder: "e.g., Pain Relief",
    stockQuantity: "Stock Quantity",
    price: "Price (RWF)",
    expiryDate: "Expiry Date",
    cancel: "Cancel",
    update: "Update",
    searchMedicines: "Search medicines...",
    stock: "Stock",
    outOfStock: "Out of Stock",
    lowStock: "Low Stock",
    inStock: "In Stock",
    edit: "Edit",
    noMedicinesFound: "No medicines found",
    medicineUpdated: "Medicine updated successfully",
    medicineAdded: "Medicine added successfully",
    medicineDeleted: "Medicine deleted successfully",
    strength: "Strength/Dosage",
    strengthPlaceholder: "e.g., 500mg, Strong, Mild",
    similarMedicines: "Similar Medicines",
    similarMedicineName: "Similar Medicine Name",
    
    // Search Page
    findMedicineNearYou: "Find Medicine Near You",
    yourLocation: "Your Location",
    locationPlaceholder: "Enter your location (e.g., Kigali, Nyarugenge)",
    useCurrentLocation: "Use my current location",
    searchResults: "Results for",
    foundIn: "Found in",
    pharmaciesNearYou: "pharmacies near you",
    getDirections: "Get Directions",
    call: "Call",
    filter: "Filter",
    pharmaciesNearYouMap: "Pharmacies Near You",
    mapComingSoon: "Map integration coming soon",
    clickGetDirections: "Click 'Get Directions' to open in Google Maps",
    searchForMedicine: "Search for Medicine",
    enterMedicineName: "Enter the name of the medicine you're looking for to find pharmacies near you with available stock.",
    similarMedicinesAvailable: "Similar Medicines Available",
    viewAlternative: "View Alternative",
    distanceFromYou: "from you",
    
    // Document Upload
    addManually: "Add Manually",
    addFromDocument: "Add from Document",
    uploadDocument: "Upload Document",
    uploadDocumentDesc: "Upload an Excel, CSV, or text file with medicine data",
    selectFile: "Select File",
    supportedFormats: "Supported formats: .xlsx, .csv, .txt",
    processingDocument: "Processing document...",
    medicinesImported: "medicines imported successfully",
    importError: "Error importing medicines",
    similarMedicinePrice: "Price (RWF)",
    addSimilar: "Add Similar",
    removeSimilar: "Remove",
    
    // Ad Carousel
    premiumPartner: "Premium Partner",
    rating: "rating",
  },
  rw: {
    // Navbar
    home: "Ahabanza",
    findMedicine: "Shakisha Imiti",
    about: "Ibyerekeye",
    login: "Injira",
    getStarted: "Tangira",
    search: "Shakisha",
    english: "Icyongereza",
    kinyarwanda: "Ikinyarwanda",
    french: "Igifaransa",
    
    // Hero Section
    heroTag: "Uburyo bwa mbere bwo gushakisha imiti mu Rwanda",
    heroTitle: "Shaka Imiti yawe ku",
    heroTitleHighlight: "Farumasi Iri Hafi",
    heroDescription: "Shakisha imiti iyo ari yo yose kandi umenye farumasi iri hafi yawe ifite umuti. Bika igihe, ugume muzima.",
    searchPlaceholder: "Shakisha umuti (urugero: Paracetamol)",
    medicinesListed: "Imiti Yanditswe",
    pharmacies: "Farumasi",
    happyUsers: "Abakoresha Bashimye",
    
    // Features
    whyChoose: "Kuki Wahitamo",
    whyChooseDescription: "Duhujije na farumasi zemejwe mu Rwanda hose, bikoroheye gushaka umuti ukeneye.",
    searchMedicine: "Shakisha Umuti",
    searchMedicineDesc: "Shaka umuti uwo ari wo wose ako kanya ukoresheje ishakiro ryacu",
    nearbyPharmacies: "Farumasi Ziri Hafi",
    nearbyPharmaciesDesc: "Menya farumasi ziri hafi yawe zifite umuti",
    realTimeStock: "Stock Igihe Nyacyo",
    realTimeStockDesc: "Bona amakuru y'imiti agihe gishya",
    verifiedPharmacies: "Farumasi Zemejwe",
    verifiedPharmaciesDesc: "Farumasi zose zemejwe kandi zifite uruhushya",
    
    // CTA
    pharmacyOwner: "Uri Nyir'ubwishingizi bwa Farumasi?",
    pharmacyOwnerDesc: "Injira muri UMUTI kugirango wongerwe uboneka kandi ugere ku bakiriya benshi. Gera imiti yawe byoroshye kandi uzamure ubucuruzi bwawe.",
    registerPharmacy: "Andikisha Farumasi Yawe",
    loginDashboard: "Injira Kuri Dashboard",
    
    // Footer
    footerDescription: "Shaka umuti wawe ku farumasi iri hafi. Byihuse, byoroshye, kandi bikwizera.",
    quickLinks: "Aho Kwinjira Vuba",
    forPharmacies: "Kuri Farumasi",
    contact: "Twandikire",
    allRightsReserved: "Uburenganzira bwose bwarinzwe.",
    
    // About Page
    howToUse: "Uko Wakoresha",
    aboutDescription: "Niba ushaka umuti cyangwa ugenzura farumasi, UMUTI bikoroshya.",
    forUsers: "Ku Bakoresha",
    forUsersDesc: "Shaka umuti ukeneye ku farumasi iri hafi yawe mu ntambwe zoroshye.",
    forPharmacists: "Ku Bafarumasi",
    forPharmacistsDesc: "Genzura imiti ya farumasi yawe kandi ugere ku bakiriya benshi binyuze muri UMUTI.",
    step1User: "Shakisha umuti wawe",
    step1UserDesc: "Andika izina ry'umuti ushaka mu ishakiro.",
    step2User: "Reba farumasi ziri hafi",
    step2UserDesc: "Reba urutonde rwa farumasi zifite umuti, zitondetswe ukurikije intera.",
    step3User: "Bona inzira",
    step3UserDesc: "Kanda kuri farumasi kugirango ubone aho iri no kubona inzira yo gufata umuti wawe.",
    step1Pharmacist: "Andikisha farumasi yawe",
    step1PharmacistDesc: "Fungura konti wandike amakuru ya farumasi yawe kugirango yemezwe.",
    step2Pharmacist: "Ongeraho imiti yawe",
    step2PharmacistDesc: "Koresha dashboard yo kongeraho imiti, gushyiraho ibiciro, no gucunga stock.",
    step3Pharmacist: "Zamura ubucuruzi bwawe",
    step3PharmacistDesc: "Abakiriya bazashakisha farumasi yawe iyo bashaka imiti ufite.",
    
    // Medicine Management
    medicines: "Imiti",
    manageInventory: "Genzura imiti ya farumasi yawe",
    addMedicine: "Ongeraho Umuti",
    editMedicine: "Hindura Umuti",
    addNewMedicine: "Ongeraho Umuti Mushya",
    medicineName: "Izina ry'Umuti",
    medicineNamePlaceholder: "urugero: Paracetamol 500mg",
    category: "Icyiciro",
    categoryPlaceholder: "urugero: Imiti y'Ububabare",
    stockQuantity: "Umubare w'Imiti",
    price: "Igiciro (RWF)",
    expiryDate: "Itariki y'Irangira",
    cancel: "Hagarika",
    update: "Hindura",
    searchMedicines: "Shakisha imiti...",
    stock: "Stock",
    outOfStock: "Ntayo",
    lowStock: "Iri Hasi",
    inStock: "Irahari",
    edit: "Hindura",
    noMedicinesFound: "Nta miti yabonetse",
    medicineUpdated: "Umuti wahinduwe neza",
    medicineAdded: "Umuti wongewe neza",
    medicineDeleted: "Umuti wahanaguwe neza",
    strength: "Imbaraga/Ingano",
    strengthPlaceholder: "urugero: 500mg, Ikomeye, Yoroheje",
    similarMedicines: "Imiti Isa Nayo",
    similarMedicineName: "Izina ry'Umuti Usa",
    similarMedicinePrice: "Igiciro (RWF)",
    addSimilar: "Ongeraho Usa",
    removeSimilar: "Kuraho",
    
    // Search Page
    findMedicineNearYou: "Shakisha Umuti Hafi Yawe",
    yourLocation: "Aho Uri",
    locationPlaceholder: "Andika aho uri (urugero: Kigali, Nyarugenge)",
    useCurrentLocation: "Koresha aho ndi",
    searchResults: "Ibisubizo bya",
    foundIn: "Yabonetse muri",
    pharmaciesNearYou: "farumasi ziri hafi yawe",
    getDirections: "Bona Inzira",
    call: "Hamagara",
    filter: "Shungura",
    pharmaciesNearYouMap: "Farumasi Ziri Hafi Yawe",
    mapComingSoon: "Ikarita iraza vuba",
    clickGetDirections: "Kanda 'Bona Inzira' kugirango ufungure muri Google Maps",
    searchForMedicine: "Shakisha Umuti",
    enterMedicineName: "Andika izina ry'umuti ushaka kugirango ubone farumasi ziri hafi yawe zifite stock.",
    similarMedicinesAvailable: "Imiti Isa Nayo Iraboneka",
    viewAlternative: "Reba Iyindi",
    distanceFromYou: "uvuye aho uri",
    
    // Document Upload
    addManually: "Ongeraho Wenyine",
    addFromDocument: "Ongeraho Binyuze mu Nyandiko",
    uploadDocument: "Shyiramo Inyandiko",
    uploadDocumentDesc: "Shyiramo dosiye ya Excel, CSV, cyangwa inyandiko ifite amakuru y'imiti",
    selectFile: "Hitamo Dosiye",
    supportedFormats: "Ubwoko bushyigikiwe: .xlsx, .csv, .txt",
    processingDocument: "Gusoma inyandiko...",
    medicinesImported: "imiti yashyizwe neza",
    importError: "Ikosa mu gushyira imiti",
    
    // Ad Carousel
    premiumPartner: "Umunyamuryango Wujuje",
    rating: "amanota",
  },
  fr: {
    // Navbar
    home: "Accueil",
    findMedicine: "Trouver Médicament",
    about: "À Propos",
    login: "Connexion",
    getStarted: "Commencer",
    search: "Rechercher",
    english: "Anglais",
    kinyarwanda: "Kinyarwanda",
    french: "Français",
    
    // Hero Section
    heroTag: "Le #1 Recherche de Médicaments au Rwanda",
    heroTitle: "Trouvez Votre Médicament à la",
    heroTitleHighlight: "Pharmacie la Plus Proche",
    heroDescription: "Recherchez n'importe quel médicament et découvrez quelles pharmacies près de chez vous l'ont en stock. Gagnez du temps, restez en bonne santé.",
    searchPlaceholder: "Rechercher un médicament (ex: Paracétamol)",
    medicinesListed: "Médicaments Listés",
    pharmacies: "Pharmacies",
    happyUsers: "Utilisateurs Satisfaits",
    
    // Features
    whyChoose: "Pourquoi Choisir",
    whyChooseDescription: "Nous vous connectons avec des pharmacies vérifiées à travers le Rwanda, facilitant la recherche du médicament dont vous avez besoin.",
    searchMedicine: "Rechercher Médicament",
    searchMedicineDesc: "Trouvez n'importe quel médicament instantanément avec notre recherche puissante",
    nearbyPharmacies: "Pharmacies Proches",
    nearbyPharmaciesDesc: "Découvrez les pharmacies les plus proches avec du stock disponible",
    realTimeStock: "Stock en Temps Réel",
    realTimeStockDesc: "Obtenez des informations d'inventaire précises et à jour",
    verifiedPharmacies: "Pharmacies Vérifiées",
    verifiedPharmaciesDesc: "Toutes les pharmacies sont agréées et vérifiées",
    
    // CTA
    pharmacyOwner: "Êtes-vous Propriétaire de Pharmacie?",
    pharmacyOwnerDesc: "Rejoignez UMUTI pour augmenter votre visibilité et atteindre plus de clients. Gérez votre inventaire facilement et développez votre entreprise.",
    registerPharmacy: "Enregistrer Votre Pharmacie",
    loginDashboard: "Connexion au Tableau de Bord",
    
    // Footer
    footerDescription: "Trouvez votre médicament à la pharmacie la plus proche. Rapide, facile et fiable.",
    quickLinks: "Liens Rapides",
    forPharmacies: "Pour les Pharmacies",
    contact: "Contact",
    allRightsReserved: "Tous droits réservés.",
    
    // About Page
    howToUse: "Comment Utiliser",
    aboutDescription: "Que vous cherchiez un médicament ou gériez une pharmacie, UMUTI simplifie tout.",
    forUsers: "Pour les Utilisateurs",
    forUsersDesc: "Trouvez le médicament dont vous avez besoin dans une pharmacie près de chez vous en quelques étapes simples.",
    forPharmacists: "Pour les Pharmaciens",
    forPharmacistsDesc: "Gérez l'inventaire de votre pharmacie et atteignez plus de clients grâce à UMUTI.",
    step1User: "Recherchez votre médicament",
    step1UserDesc: "Tapez le nom du médicament que vous recherchez dans la barre de recherche.",
    step2User: "Voir les pharmacies proches",
    step2UserDesc: "Consultez la liste des pharmacies qui ont le médicament en stock, triées par distance.",
    step3User: "Obtenir l'itinéraire",
    step3UserDesc: "Cliquez sur une pharmacie pour voir son emplacement et obtenir l'itinéraire pour récupérer votre médicament.",
    step1Pharmacist: "Enregistrez votre pharmacie",
    step1PharmacistDesc: "Créez un compte et soumettez les détails de votre pharmacie pour vérification.",
    step2Pharmacist: "Ajoutez vos médicaments",
    step2PharmacistDesc: "Utilisez le tableau de bord pour ajouter des médicaments, fixer les prix et gérer les niveaux de stock.",
    step3Pharmacist: "Développez votre entreprise",
    step3PharmacistDesc: "Les clients trouveront votre pharmacie lorsqu'ils rechercheront des médicaments que vous avez en stock.",
    
    // Medicine Management
    medicines: "Médicaments",
    manageInventory: "Gérer l'inventaire de votre pharmacie",
    addMedicine: "Ajouter Médicament",
    editMedicine: "Modifier Médicament",
    addNewMedicine: "Ajouter Nouveau Médicament",
    medicineName: "Nom du Médicament",
    medicineNamePlaceholder: "ex: Paracétamol 500mg",
    category: "Catégorie",
    categoryPlaceholder: "ex: Anti-douleur",
    stockQuantity: "Quantité en Stock",
    price: "Prix (RWF)",
    expiryDate: "Date d'Expiration",
    cancel: "Annuler",
    update: "Mettre à jour",
    searchMedicines: "Rechercher des médicaments...",
    stock: "Stock",
    outOfStock: "Rupture de Stock",
    lowStock: "Stock Faible",
    inStock: "En Stock",
    edit: "Modifier",
    noMedicinesFound: "Aucun médicament trouvé",
    medicineUpdated: "Médicament mis à jour avec succès",
    medicineAdded: "Médicament ajouté avec succès",
    medicineDeleted: "Médicament supprimé avec succès",
    strength: "Force/Dosage",
    strengthPlaceholder: "ex: 500mg, Fort, Léger",
    similarMedicines: "Médicaments Similaires",
    similarMedicineName: "Nom du Médicament Similaire",
    similarMedicinePrice: "Prix (RWF)",
    addSimilar: "Ajouter Similaire",
    removeSimilar: "Supprimer",
    
    // Search Page
    findMedicineNearYou: "Trouver Médicament Près de Vous",
    yourLocation: "Votre Emplacement",
    locationPlaceholder: "Entrez votre emplacement (ex: Kigali, Nyarugenge)",
    useCurrentLocation: "Utiliser ma position actuelle",
    searchResults: "Résultats pour",
    foundIn: "Trouvé dans",
    pharmaciesNearYou: "pharmacies près de vous",
    getDirections: "Obtenir l'Itinéraire",
    call: "Appeler",
    filter: "Filtrer",
    pharmaciesNearYouMap: "Pharmacies Près de Vous",
    mapComingSoon: "Intégration de carte bientôt disponible",
    clickGetDirections: "Cliquez sur 'Obtenir l'Itinéraire' pour ouvrir dans Google Maps",
    searchForMedicine: "Rechercher un Médicament",
    enterMedicineName: "Entrez le nom du médicament que vous recherchez pour trouver les pharmacies près de vous avec du stock disponible.",
    similarMedicinesAvailable: "Médicaments Similaires Disponibles",
    viewAlternative: "Voir Alternative",
    distanceFromYou: "de vous",
    
    // Document Upload
    addManually: "Ajouter Manuellement",
    addFromDocument: "Ajouter depuis Document",
    uploadDocument: "Télécharger Document",
    uploadDocumentDesc: "Téléchargez un fichier Excel, CSV ou texte avec les données des médicaments",
    selectFile: "Sélectionner Fichier",
    supportedFormats: "Formats supportés: .xlsx, .csv, .txt",
    processingDocument: "Traitement du document...",
    medicinesImported: "médicaments importés avec succès",
    importError: "Erreur lors de l'importation des médicaments",
    
    // Ad Carousel
    premiumPartner: "Partenaire Premium",
    rating: "note",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

const languageLabels: Record<Language, string> = {
  en: "EN",
  rw: "RW",
  fr: "FR",
};

const LanguageSwitcher = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Globe className="h-4 w-4" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => setLanguage("en")}
          className={language === "en" ? "bg-accent" : ""}
        >
          🇬🇧 {t("english")}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLanguage("rw")}
          className={language === "rw" ? "bg-accent" : ""}
        >
          🇷🇼 {t("kinyarwanda")}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLanguage("fr")}
          className={language === "fr" ? "bg-accent" : ""}
        >
          🇫🇷 {t("french")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
