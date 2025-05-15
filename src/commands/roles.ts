// TODO: move subcommands into own file

import {
    addRole,
    deleteRole,
    getGuildRoles,
    getRole,
    updateRole,
} from "../db/querys.ts";
import { ICommand } from "../struct/Command.ts";
import CommandCategory from "../struct/CommandCategory.ts";

const RoleCommand: ICommand = {
    commandName: "roles",
    category: CommandCategory.ADMIN,
    desc: "Edit roles.",
    longDesc: "Add, edit or delete roles.",
    admin: true,
    args: [{
        name: "operation",
        description: "One of the following:\n" +
            "        add    : Add a new role.\n" +
            "        edit   : Edit an existing role.\n" +
            "        delete : Remove a role.\n" +
            "        list   : Lists current roles.",
        required: true,
        validate: (arg) => {
            if (!["add", "edit", "delete", "list"].includes(arg)) {
                return `${arg} is not a valid operation!`;
            }

            return null;
        },
    }, {
        name: "role id",
        description: "The id of the role to operate on.",
        required: false,
        validate: (arg) => {
            if (!arg.match(/^(?<id>\d{17,20})$/)) {
                return `${arg} is not a valid role id!`;
            }

            return null;
        },
    }, {
        name: "level",
        description: "The level of the role added/edited.",
        required: false,
        validate: (arg) => {
            if (!arg.match(/^-?\d+$/)) {
                return `${arg} is not a valid level!`;
            }

            return null;
        },
    }],

    exec: async (client, message, operation, roleId, level) => {
        // List operation
        if (operation === "list") {
            const roles = await getGuildRoles(client, message.guild?.id);

            let msg = "";
            roles.forEach((role) => {
                msg += `<@&${role.id}>: Unlocked at level ${role.level}.\n`;
            });

            const embed = client.embeds.replyEmbed("Roles for anime@UTS.", msg);
            return message.reply({ embeds: [embed] });
        }

        if (!roleId) {
            const embed = client.embeds
                .errorEmbed("You must input a role id!");

            return message.reply({ embeds: [embed] });
        }

        const role = await getRole(client, roleId);

        // Delete operation
        if (operation === "delete") {
            if (!role) {
                const embed = client.embeds
                    .errorEmbed("This role doesn't exist yet!");

                return message.reply({ embeds: [embed] });
            }

            await deleteRole(client, roleId);
            const embed = client.embeds.replyEmbed(
                "Role deleted!",
                `Deleted <@&${role.id}> from role list!`,
            );

            return message.reply({ embeds: [embed] });
        }

        if (!level) {
            const embed = client.embeds
                .errorEmbed("You must input a level for the role!");

            return message.reply({ embeds: [embed] });
        }

        // Add operation
        if (operation === "add") {
            if (role) {
                const embed = client.embeds
                    .errorEmbed(
                        "This role already exists! Did you mean to use the operator `edit`?",
                    );

                return message.reply({ embeds: [embed] });
            }

            if (!message.guild?.roles.fetch(roleId)) {
                const embed = client.embeds
                    .errorEmbed(`Role \`${roleId}\` doesn't exist!`);

                return message.reply({ embeds: [embed] });
            }

            const newRole = await addRole(
                client,
                roleId,
                message.guild?.id,
                parseInt(level),
            );
            const embed = client.embeds.replyEmbed(
                "New role added!",
                `Role <@&${newRole.id}> added with level ${newRole.level}.`,
            );

            return message.reply({ embeds: [embed] });
        }

        // Edit operation
        if (operation === "edit") {
            if (!role) {
                const embed = client.embeds
                    .errorEmbed(
                        "This role doesnt exist! Did you mean to use the operator `add`?",
                    );

                return message.reply({ embeds: [embed] });
            }

            if (!message.guild?.roles.fetch(roleId)) {
                const embed = client.embeds
                    .errorEmbed(`Role \`${roleId}\` doesn't exist!`);

                return message.reply({ embeds: [embed] });
            }

            const newRole = await updateRole(client, roleId, parseInt(level));
            const embed = client.embeds.replyEmbed(
                "Role edited!",
                `Role <@&${newRole.id}> edited to be level ${newRole.level}.`,
            );

            return message.reply({ embeds: [embed] });
        }
    },
};

export default RoleCommand;
