export const DATA = {
  este: {
    themeColor: "bg-[#1F4E5F]",
    logoText: "este",
    tagline: "Hotel estetik gen-Z approved",
    hotels: [
      {
        id: 1,
        name: "Canggu Villas, Yogyakarta",
        desc: "Vibe resort dengan private pool ala-ala Mexico-Mediteranian",
        price: "950.000",
        images: [
          "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=800",
          "https://images.unsplash.com/photo-1573599205948-43690f05566a?auto=format&fit=crop&q=80&w=800",
          "https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&q=80&w=800"
        ],
        address: "Jl. Pantai Batu Bolong, Canggu",
        rating: 4.5,
        rooms: [] // Jika kosong, UI akan handle
      },
      {
        id: 2,
        name: "Fulmar Pasteur, Bandung",
        desc: "Hotel kekinian dengan warm lighting yang instagramable",
        price: "572.000",
        images: [
          "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=800",
          "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800",
          "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=800"
        ],
        address: "Jl. Babakan Jeruk Indah I No.4, Sukagalih, Bandung",
        rating: 4.0,
        rooms: [
          {
            name: "Grand Room, Balcony",
            bed: "Queen bed",
            breakfast: true,
            refundable: true,
            price: "572.000",
            image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=800"
          },
          {
            name: "Deluxe Room",
            bed: "Queen bed",
            breakfast: true,
            refundable: false,
            price: "541.000",
            image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=800"
          },
          {
            name: "Art Deco Room",
            bed: "Queen bed",
            breakfast: true,
            refundable: false,
            price: "555.000",
            image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800"
          },
        ]
      }
    ]
  },
  view: {
    themeColor: "bg-[#0F281E]",
    logoText: "view",
    tagline: "Staycation cantik view alam",
    hotels: [
      {
        id: 3,
        name: "Heha Ocean, Yogyakarta",
        desc: "Ocean view cabin dan glamping dengan vibe Greece-Mediteranian",
        price: "990.000",
        images: [
          "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800",
          "https://images.unsplash.com/photo-1469796466635-61b8eede4be4?auto=format&fit=crop&q=80&w=800",
          "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=800"
        ],
        address: "Bolang, Girikarto, Panggang, Gunungkidul, Yogyakarta 55872",
        rating: 4.0,
        rooms: [
          {
            name: "Glamping Superior",
            bed: "Queen bed",
            breakfast: true,
            refundable: false,
            price: "990.000",
            image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=800"
          },
          {
            name: "Cabin Deluxe",
            bed: "Queen bed",
            breakfast: true,
            refundable: true,
            price: "1.041.000",
            image: "https://images.unsplash.com/photo-1469796466635-61b8eede4be4?auto=format&fit=crop&q=80&w=800"
          },
          {
            name: "Glamping Plunge Pool",
            bed: "Queen bed",
            breakfast: true,
            refundable: true,
            price: "1.200.000",
            image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800"
          },
        ]
      },
      {
        id: 4,
        name: "Bobocabin Pengalengan",
        desc: "Cabin di tengah kebun teh dengan view pegunungan nan-estetik",
        price: "982.000",
        images: [
          "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&q=80&w=800",
          "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=800",
          "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=800"
        ],
        address: "Pangalengan, Bandung",
        rating: 4.8,
        rooms: []
      }
    ]
  },
  heal: {
    themeColor: "bg-[#0E6ba8]",
    logoText: "heal",
    tagline: "Budget healing paling worth it",
    hotels: [
      {
        id: 5,
        name: "Sanghyang Indah Resort, Banten",
        desc: "Sea-side resort untuk menikmati sunset di tepi pantai",
        price: "368.000",
        images: [
          "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&q=80&w=800",
          "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&q=80&w=800",
          "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=800"
        ],
        address: "Jl. Raya Sirih KM. 128, Kec. Anyer, Serang, Banten 42166",
        rating: 4.0,
        rooms: [
          {
            name: "Sanghyang Deluxe",
            bed: "Queen bed",
            breakfast: true,
            refundable: true,
            price: "368.000",
            image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&q=80&w=800"
          },
          {
            name: "Sanghyang Garden",
            bed: "Queen bed",
            breakfast: true,
            refundable: true,
            price: "398.000",
            image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=800"
          },
          {
            name: "Sanghyang Ocean",
            bed: "Queen bed",
            breakfast: true,
            refundable: true,
            price: "488.000",
            image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800"
          },
        ]
      },
      {
        id: 6,
        name: "Smart Hotel Thamrin, Jakarta",
        desc: "Healing tipis-tipis sambil menikmati city view dan city light",
        price: "531.000",
        images: [
          "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&q=80&w=800",
          "https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?auto=format&fit=crop&q=80&w=800",
          "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&q=80&w=800",
        ],
        address: "Jl. Thamrin, Jakarta Pusat",
        rating: 4.2,
        rooms: []
      }
    ]
  }
};