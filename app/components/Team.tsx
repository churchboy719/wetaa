export default function Team() {
    const teamMembers = [
      {
        name: 'Sophia Reynolds',
        role: 'CEO & Founder',
        bio: 'Sophia has over 15 years of experience in the restaurant tech industry. Passionate about innovation, she leads the team with a vision to revolutionize the dining experience.',
        image: 'https://via.placeholder.com/150'
      },
      {
        name: 'Michael Grant',
        role: 'Head of Product',
        bio: 'With a background in product management and UX design, Michael ensures our platform is intuitive and meets the needs of vendors and customers alike.',
        image: 'https://via.placeholder.com/150'
      },
      {
        name: 'Emily Chen',
        role: 'CTO',
        bio: 'Emily is a tech enthusiast with expertise in building scalable, secure applications. She oversees the development team and ensures seamless performance.',
        image: 'https://via.placeholder.com/150'
      }
    ];
  
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">Meet Our Team</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden p-6 transform transition duration-300 hover:scale-105">
                <img className="w-40 h-40 object-cover rounded-full mx-auto" src={member.image} alt={member.name} />
                <h2 className="text-2xl font-semibold text-gray-700 text-center mt-6">{member.name}</h2>
                <p className="text-indigo-600 text-center font-medium">{member.role}</p>
                <p className="text-gray-600 text-center mt-4">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  