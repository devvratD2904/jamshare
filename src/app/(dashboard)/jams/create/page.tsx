import { CreateJamForm } from "@/components/jams/CreateJamForm";

export default function CreateJamPage() {
    return (
        <div className="flex flex-col p-8 md:p-12">
            <h1 className="text-3xl font-bold text-white mb-8 text-center">Start Sharing</h1>
            <CreateJamForm />
        </div>
    );
}
