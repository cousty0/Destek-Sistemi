const impEvent = async eventName => (await import(`../events/${eventName}.js`)).default;
export default async (client) => {
    client.on("ready", async () => (await impEvent("ready"))(client));
    client.on("interactionCreate", await impEvent("interactionCreate"));
}