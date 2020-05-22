import mock from "./../mock";

const thsrsDB = {
    thsrs: [
        "항암물질",
        "항암치료약",
        "항암치료재",
        "항암치료제",
        "ANTICANCER AGENT",
        "ANTICANCER AGENT",
        "ANTICANCER MEDICINE",
        "ANTICANCEROGENICS",
        "ANTITUMORIGENIC AGENT",
        "CARCINOSTATIC AGENT",
        "CARCINOSTATIS SUBSTANCE",
        "anticancer agent",
        "anticancer medicine",
        "anticancerogenics",
        "antitumorigenic agent",
        "carcinostatic agent",
        "carcinostatis substance"
    ]
};

mock.onGet("/api/search-app/thsrs").reply(config => {
    return [200, thsrsDB.thsrs];
});
