import useFetch from '../../hooks/useFetch';
import Spinner from '../../components/Spinner';
import BikeCard from '../../components/BikeCard';

const BikeList = () => {
  const { data: bikes, loading, error } = useFetch('bikes/');

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-500">{error.message || String(error)}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 p-3">Available Bikes</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {bikes.map(bike => (
          <BikeCard key={bike.id} bike={bike} />
        ))}
      </div>
    </div>
  );
};

export default BikeList;
