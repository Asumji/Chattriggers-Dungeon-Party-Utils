import request from "requestV2/index";
relevantItems = ["scylla", "hyperion", "astraea", "valkyrie", "terminator", "juju", "axe of the shredded", "livid dagger", "spirit bow", "last breath"]

const getrequest = function(url) {
  return request({
      url: url,
      headers: {
          'User-Agent': 'Mozilla/5.0 (ChatTriggers)'
      },
      json: true
  });
}

function buildOutput(player, items) {
  string = "§cName:§b " + player + "\n\n§l§6Items:§r\n" + items
  ChatLib.chat(string)
}

register('Chat', (event) => {
  let unformattedMessage = ChatLib.removeFormatting(ChatLib.getChatMessage(event))
  unformattedMessage = unformattedMessage.replace(/ /g,"")

  let name = ""
  for (let i = 0;i<unformattedMessage.indexOf("joinedthedungeongroup");i++) {
      if (i > unformattedMessage.indexOf(">")) {
          name = name + unformattedMessage[i]
      }
  }

  getrequest("https://api.mojang.com/users/profiles/minecraft/" + name).then(response => {
    let uuid = response["id"];
    getrequest("https://api.hypixel.net/player?key=" + "dc30eb03-f088-4038-81a1-58e249f72c5c" + "&uuid=" + uuid).then(response => {
      getrequest("https://api.hypixel.net/skyblock/profiles?key=" + "dc30eb03-f088-4038-81a1-58e249f72c5c" + "&uuid=" + uuid).then(response => {
        let profiles = response["profiles"]
        let itemString = ""
        profiles.forEach(profile => {
          if (profile["members"][uuid]["inv_contents"] == null) {
            itemString = itemString
          } else {
            let invContents = profile["members"][uuid]["inv_contents"]["data"]
            let bytearray = java.util.Base64.getDecoder().decode(invContents);
            let inputstream = new java.io.ByteArrayInputStream(bytearray);                                
            let nbt = net.minecraft.nbt.CompressedStreamTools.func_74796_a(inputstream); //CompressedStreamTools.readCompressed()                            
            let items = nbt.func_150295_c("i", 10); //NBTTagCompound.getTagList()
            let length = items.func_74745_c(); //NBTTagList.tagCount()

            itemArray = []
            for(let i = 0; i < length; i++){                                    
              item = items.func_150305_b(i); //NBTTagList.getCompoundTagAt()
              if(!item.func_82582_d()) { //NBTTagCompound.hasNoTags()
                Name = item.func_74781_a("tag").func_74781_a("display").func_74781_a("Name").toString().replace(/"/g,"") //NBTTagCompound.getTag()
                itemArray.push(Name)
              }
            }
            string = ""
            for(let i = 0; i < itemArray.length; i++) {
              for (let j = 0; j < relevantItems.length; j++) {
                if (itemArray[i].toLowerCase().includes(relevantItems[j])) {
                  string = string + " " + itemArray[i]
                }
              }
            }
            itemString = itemString + profile["cute_name"] + ":" + string + "§r\n"
          }
        })
        buildOutput(name, itemString)
      })
    })
  });

}).setChatCriteria("joined the dungeon group!").setContains();







//{id:267s,Count:1b,tag:{ench:[],Unbreakable:1b,HideFlags:254,display:{Lore:[0:"§7Gear Score: §d966 §8(3208)",1:"§7Damage: §c+354 §e(+20) §8(+1,370.13)",2:"§7Strength: §c+185 §e(+20) §8(+712.3)",3:"§7Crit Chance: §c+23.2% §9(+10%) §8(+33%)",4:"§7Crit Damage: §c+235.5% §9(+110%) §8(+972.08%)",5:"§7Intelligence: §a+55 §8(+209.5)",6:"§7Ferocity: §a+33 §8(+45)",7:" §8[§8⚔§8] §8[§8⚔§8]",8:"",9:"§d§l§d§lUltimate Wise V§9, §9Champion X§9, §9Cleave V",10:"§9Critical V§9, §9Cubism V§9, §9Ender Slayer V",11:"§9Experience III§9, §9Fire Aspect II§9, §9First Strike IV",12:"§9Giant Killer V§9, §9Impaling III§9, §9Lethality V",13:"§9Looting III§9, §9Luck V§9, §9Prosecute V",14:"§9Scavenger III§9, §9Smite VII§9, §9Syphon III",15:"§9Thunderlord V§9, §9Vampirism V§9, §9Venomous V",16:"",17:"§a◆ Jerry Rune III",18:"",19:"§7Deals +§c50% §7damage to",20:"§7Withers. Grants §c+1 §c❁ Damage",21:"§c§7and §a+1 §9☠ Crit Damage §7per",22:"§7§cCatacombs §7level.",23:"",24:"§aScroll Abilities:",25:"§6Ability: Wither Impact §e§lRIGHT CLICK",26:"§7Teleport §a10 blocks§7 ahead of",27:"§7you. Then implode dealing",28:"§7§c19,435 §7damage to nearby",29:"§7enemies. Also applies the wither",30:"§7shield scroll ability reducing",31:"§7damage taken and granting an",32:"§7absorption shield for §e5",33:"§e§7seconds.",34:"§8Mana Cost: §3150",35:"",36:"§9Suspicious Bonus",37:"§7Increases weapon damage by",38:"§7§c+15§7.",39:"",40:"§d§l§ka§r §d§l§d§lMYTHIC DUNGEON SWORD §d§l§ka"],Name:"§dSuspicious Scylla §6✪§6✪§6✪§6✪§6✪"},ExtraAttributes:{rarity_upgrades:1,hot_potato_count:10,runes:{JERRY:3},champion_combat_xp:7321829.6145212995d,modifier:"suspicious",upgrade_level:5,id:"SCYLLA",enchantments:{impaling:3,luck:5,critical:5,cleave:5,smite:7,looting:3,syphon:3,scavenger:3,ender_slayer:5,fire_aspect:2,experience:3,vampirism:5,giant_killer:5,first_strike:4,venomous:5,thunderlord:5,ultimate_wise:5,cubism:5,champion:10,lethality:5,PROSECUTE:5},uuid:"51325c5f-7b95-446c-92cc-a259f81c0380",ability_scroll:[0:"WITHER_SHIELD_SCROLL",1:"IMPLOSION_SCROLL",2:"SHADOW_WARP_SCROLL"],timestamp:"8/16/22 6:00 AM"}},Damage:0s}