import React, { useState } from "react";
import gql from "graphql-tag";
import { useQuery, useMutation } from "@apollo/react-hooks";
import PetsList from "../components/PetsList";
import NewPetModal from "../components/NewPetModal";
import Loader from "../components/Loader";
import { AddTypenameToAbstract } from "graphql-tools";

const ALL_PETS = gql`
  query AllPets {
    pets {
      name
      id
      type
      img
    }
  }
`;

const NEW_PET = gql`
  mutation createPet($newPet: NewPetInput!) {
    addPet(input: $newPet) {
      id
      name
      type
      img
    }
  }
`;

export default function Pets() {
  const [modal, setModal] = useState(false);
  const { data, loading, error } = useQuery(ALL_PETS);
  // Updating the cache allows updates to show up in the UI instantly rather than needing to refresh
  const [createPet, newPet] = useMutation(NEW_PET, {
    update(cache, { data: { addPet } }) {
      const data = cache.readQuery({ query: ALL_PETS });
      cache.writeQuery({
        query: ALL_PETS,
        data: { pets: [addPet, ...data.pets] },
      });
    },
  });

  const onSubmit = (input) => {
    setModal(false);
    createPet({
      variables: { newPet: input },
      // This needs to look exactly like the object coming back from the server including the __typename: "Mutation" which is hidden in the schema but added automatically by GraphQL
      optimisticResponse: {
        __typename: "Mutation",
        addPet: {
          __typename: "Pet",
          id: Math.floor(Math.random() * 1000) + "",
          name: input.name,
          type: input.type,
          img: "https://via.placeholder.com/300",
        },
      },
    });
  };

  if (loading) {
    return <Loader />;
  }

  if (error || newPet.error) {
    return <p>error</p>;
  }

  if (modal) {
    return <NewPetModal onSubmit={onSubmit} onCancel={() => setModal(false)} />;
  }

  return (
    <div className="page pets-page">
      <section>
        <div className="row betwee-xs middle-xs">
          <div className="col-xs-10">
            <h1>Pets</h1>
          </div>

          <div className="col-xs-2">
            <button onClick={() => setModal(true)}>new pet</button>
          </div>
        </div>
      </section>
      <section>
        <PetsList pets={data.pets} />
      </section>
    </div>
  );
}
