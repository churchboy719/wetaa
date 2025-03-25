export default function Team() {
    const teamMembers = [
      {
        name: 'Godwin Ebuka',
        role: 'CEO & Founder',
        bio: 'Godwin has 10+ years of experience in corporate business development, with 5 years dedicated to tech product design and React.js app development.',
        image: '/ebuka.jpg'
      },
      {
        name: ' Bright Godwin',
        role: 'Head of Product',
        bio: 'Bright is also the founder of Payguard escrow payment services.',
        image: '/bryt.jpg'
      },
      {
        name: 'Aysami Ali',
        role: 'CTO',
        bio: 'With 10 years of experience as a web developer, Aysami has built or contributed to over 1,000 web app projects',
        image: '/sami.jpg'
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
  