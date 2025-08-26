import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import ViewOfficialModal from "@/features/official/viewOfficialModal";
import AddOfficialModal from "@/features/official/addOfficialModal";

type Official = {
  id: number;
  name: string;
  role: string;
  image: string;
  section: string;
  age?: number;
  contact?: string;
  term_start?: string;
  term_end?: string;
  zone?: string;
};

const sections = [
  {
    title: "Barangay Officials",
    members: ["captain", "councilors", "staffs"],
    type: "barangay",
  },
  {
    title: "SK Officials",
    members: ["captain", "councilors"],
    type: "sk",
  },
  {
    title: "Tanod Officials",
    members: ["chief", "members"],
    type: "tanod",
  },
];

export default function OfficialsPage() {
  const [officialsData, setOfficialsData] = useState(null);
  const [selectedOfficial, setSelectedOfficial] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);


  useEffect(() => {
    invoke<Official[]>("fetch_all_officials_command")
      .then((data) => {
        const structured = {
          barangay: { captain: null, councilors: [], staffs: [] },
          sk: { captain: null, councilors: [] },
          tanod: { chief: null, members: [] },
        };

        data.forEach((person) => {
          const role = person.role.toLowerCase();
          const section = person.section.toLowerCase();

          if (section === "barangay officials") {
            if (role === "barangay captain") {
              structured.barangay.captain = person;
            } else if (role === "barangay councilor") {
              structured.barangay.councilors.push(person);
            } else if (["secretary", "treasurer", "driver", "care taker"].includes(role)) {
              structured.barangay.staffs.push(person);
            }
          } else if (section === "sk officials") {
            if (role === "sk chairman") {
              structured.sk.captain = person;
            } else if (role === "sk councilor") {
              structured.sk.councilors.push(person);
            }
          } else if (section === "tanod officials") {
            if (role === "chief tanod") {
              structured.tanod.chief = person;
            } else if (role === "tanod member") {
              structured.tanod.members.push(person);
            }
          }
        });

        setOfficialsData(structured);
      })
      .catch((err) => console.error("Failed to fetch officials:", err));
  }, []);

  const viewMore = (official) => setSelectedOfficial(official);

  const ProfileCard = ({ person }) => {
    const [logo, setLogo] = useState("/logo.png");

    useEffect(() => {
      if (!person.image || person.image.trim() === "") {
        invoke("fetch_logo_command")
          .then((result) => {
            if (result) setLogo(result as string);
          })
          .catch(() => {});
      }
    }, [person.image]);

    return (
      <div
        onClick={() => viewMore(person)}
        className="cursor-pointer my-5 p-1 rounded-lg bg-white shadow-md hover:bg-gray-100 w-50 h-auto text-center scale-[1] hover:scale-100 transition-transform"
      >
        <img
          src={person.image && person.image.trim() !== "" ? person.image : logo}
          alt={person.name}
          className="rounded-full w-34 h-34 mx-auto object-cover mb-2"
        />
        <p className="text-base font-bold">{person.name}</p>
        <p className="text-sm font-bold text-gray-700">{person.role}</p>
        <div className="text-sm text-gray-700 mt-2 space-y-1">
          {person.age !== undefined && person.age !== null && <p>Age: {person.age}</p>}
          {person.contact && <p>Contact: {person.contact}</p>}
          {person.term_start && <p>Term Start: {person.term_start}</p>}
          {person.term_end && <p>Term End: {person.term_end}</p>}
          {person.zone && <p>Zone: {person.zone}</p>}
        </div>
      </div>
    );
  };

  if (!officialsData) return <div className="p-4">Loading officials...</div>;

  return (
    <div className="ml-0 pl-0 pr-2 py-6 min-w-[1500px] overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 scale-90 xl:scale-79 origin-top-left transition-transform">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Officials</h1>
        <AddOfficialModal onSave={() => {
          window.location.reload();
        }} />
      </div>

      {sections.map((section, index) => (
        <div key={index}>
          <div className="h-0.5 w-full bg-gray-500/20 my-8" />
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-center">{section.title}</h2>
            <div className="flex flex-col items-center space-y-2 mt-2">
              {section.members.map((key) => {
                const value = officialsData[section.type]?.[key];
                if (Array.isArray(value)) {
                  return (
                    <div
                      key={key}
                      className="flex gap-3 flex-wrap justify-center"
                    >
                      {value.map((person, i) => (
                        <ProfileCard key={`${key}-${i}`} person={person} />
                      ))}
                    </div>
                  );
                } else if (value && typeof value === "object") {
                  return <ProfileCard key={key} person={value} />;
                }
                return null;
              })}
            </div>
          </section>
        </div>
      ))}
      {selectedOfficial && (
        <ViewOfficialModal person={selectedOfficial} onClose={() => setSelectedOfficial(null)} />
      )}
      {isAddModalOpen && (
        <AddOfficialModal
          onSave={() => {
            setIsAddModalOpen(false);
            // re-fetch updated officials list
            invoke<Official[]>("fetch_all_officials_command")
              .then((data) => {
                const structured = {
                  barangay: { captain: null, councilors: [], staffs: [] },
                  sk: { captain: null, councilors: [] },
                  tanod: { chief: null, members: [] },
                };

                data.forEach((person) => {
                  const role = person.role.toLowerCase();
                  const section = person.section.toLowerCase();

                  if (section === "barangay officials") {
                    if (role === "barangay captain") {
                      structured.barangay.captain = person;
                    } else if (role === "barangay councilor") {
                      structured.barangay.councilors.push(person);
                    } else if (["secretary", "treasurer", "driver", "care taker"].includes(role)) {
                      structured.barangay.staffs.push(person);
                    }
                  } else if (section === "sk officials") {
                    if (role === "sk chairman") {
                      structured.sk.captain = person;
                    } else if (role === "sk councilor") {
                      structured.sk.councilors.push(person);
                    }
                  } else if (section === "tanod officials") {
                    if (role === "chief tanod") {
                      structured.tanod.chief = person;
                    } else if (role === "tanod member") {
                      structured.tanod.members.push(person);
                    }
                  }
                });

                setOfficialsData(structured);
              })
              .catch((err) => console.error("Failed to fetch officials:", err));
          }}
        />
      )}
    </div>
  );
}
